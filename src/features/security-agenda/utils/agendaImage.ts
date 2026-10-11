import { DONE_STATUSES, STATUS_STYLE, VISIT_ACTIVITY_TYPE } from '../constants'
import type { Agenda, AgendaActivity, AgendaActivityStatus } from '../types'
import { formatDuration, formatTime, toMinutes } from './time'

/**
 * PNG de la agenda del día, lista para mandarse al grupo de WhatsApp sin depender
 * del enlace. Se dibuja a mano en un canvas: una librería que fotografía el DOM
 * pesaría más que todo esto y saldría distinta en cada celular.
 *
 * Se lee como agenda y no como lista: un riel de tiempo con un punto por actividad,
 * bloques con alto según su duración y los huecos del día marcados como "libre".
 *
 * Nunca lleva el detalle de una visita de call center: ahí va `"<cliente> — <préstamo>"`,
 * y la imagen sale del sistema igual que el enlace público, que tampoco lo publica.
 */

const ANCHO = 1080
const MARGEN = 64
const COLUMNA_HORA = 190
/** El riel va entre las horas y los bloques. */
const RIEL_X = MARGEN + 158
const BLOQUE_X = MARGEN + COLUMNA_HORA
const TEXTO_X = BLOQUE_X + 26
/** Alto según la duración: más largo, más alto, sin bajar del texto ni pasar de 2.5 veces. */
const PX_POR_MINUTO = 2.2
const TOPE_ALTO = 2.5
const SEPARACION = 14
/** Dirección revisa la otra actividad cuando le comparten la agenda: va con etiqueta propia. */
const ETIQUETA_OTRA = 'OTRA ACTIVIDAD'
const FUENTE = '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

const COLOR = {
  texto: '#111827',
  tenue: '#4b5563',
  linea: '#e5e7eb',
  fondo: '#ffffff',
  banda: '#1d4ed8',
  riel: '#d1d5db',
  bloque: '#f9fafb',
  /** El ámbar de aviso del encabezado (agenda sin enviar), y su fondo muy suave. */
  aviso: '#b45309',
  avisoFondo: '#fef3c7'
}

const COLOR_ESTADO: Record<AgendaActivityStatus, string> = {
  programada: '#4b5563',
  en_curso: '#1d4ed8',
  completada: '#15803d',
  no_se_realizo: '#b91c1c',
  en_revision: '#b45309',
  realizo_otra_actividad: '#15803d'
}

interface AgendaImageInput {
  agenda: Agenda
  activities: AgendaActivity[]
  /** Línea de estado tal como la muestra la vista (`Enviada 7:12 am`). */
  estado: string
  /** Pie de la imagen: la marca de quien la comparte (`marcaDe`). */
  marca: string
}

/**
 * Marca del pie según las sucursales del usuario: un gerente de GoCash manda
 * su agenda a un grupo de GoCash, y "Xpress" ahí se leía como un error (Belén,
 * 9-oct-2026). Quien tiene sucursales de las dos ve las dos.
 */
export function marcaDe(sucursales: readonly string[]): string {
  const gocash = sucursales.some((s) => s.toUpperCase().startsWith('GERGC'))
  const xpress = sucursales.some((s) => !s.toUpperCase().startsWith('GERGC'))
  if (gocash && !xpress) return 'GoCash'
  if (gocash && xpress) return 'Xpress · GoCash'
  return 'Xpress'
}

interface Renglon {
  actividad: AgendaActivity
  titulo: string[]
  detalle: string[]
  otra: string[]
  alto: number
  /** Minutos libres antes de esta actividad; 0 si va pegada a la anterior. */
  libre: number
}

/** Tramo punteado del riel para los minutos libres entre dos actividades. */
function altoLibre(minutos: number): number {
  return Math.min(Math.max(minutos * PX_POR_MINUTO * 0.5, 56), 120)
}

/** `2026-10-08` -> `Jueves 8 de octubre de 2026`. */
function fechaLarga(fecha: string): string {
  const texto = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${fecha}T12:00:00Z`))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Parte el texto en renglones que caben en `ancho`; el último se corta con `…`. */
function partir(
  ctx: CanvasRenderingContext2D,
  texto: string,
  ancho: number,
  maximo: number
): string[] {
  const renglones: string[] = []
  let actual = ''
  for (const palabra of texto.split(/\s+/).filter(Boolean)) {
    const prueba = actual ? `${actual} ${palabra}` : palabra
    if (ctx.measureText(prueba).width <= ancho || !actual) {
      actual = prueba
      continue
    }
    renglones.push(actual)
    actual = palabra
  }
  if (actual) renglones.push(actual)
  if (renglones.length <= maximo) return renglones

  const visibles = renglones.slice(0, maximo)
  let ultimo = visibles[maximo - 1]
  while (ultimo && ctx.measureText(`${ultimo}…`).width > ancho) ultimo = ultimo.slice(0, -1)
  visibles[maximo - 1] = `${ultimo.trimEnd()}…`
  return visibles
}

function lugarDe(actividad: AgendaActivity): string {
  return [actividad.gerencia, actividad.agencia].filter(Boolean).join(' · ')
}

export async function renderAgendaImage({
  agenda,
  activities,
  estado,
  marca
}: AgendaImageInput): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = ANCHO
  const medir = canvas.getContext('2d')
  if (!medir) throw new Error('Este navegador no puede generar la imagen.')

  const anchoTexto = ANCHO - MARGEN - TEXTO_X - 20
  const ordenadas = [...activities].sort(
    (a, b) => toMinutes(a.horaInicio) - toMinutes(b.horaInicio)
  )
  medir.font = `700 22px ${FUENTE}`
  const anchoEtiqueta = medir.measureText(ETIQUETA_OTRA).width + 14

  // Primero se mide, para saber el alto; al cambiar el alto el canvas se reinicia.
  const renglones: Renglon[] = ordenadas.map((actividad, i) => {
    medir.font = `600 34px ${FUENTE}`
    const titulo = partir(medir, actividad.tipoNombre, anchoTexto, 2)
    medir.font = `400 27px ${FUENTE}`
    const textoDetalle =
      actividad.tipo === VISIT_ACTIVITY_TYPE ? '' : actividad.detalle?.trim() ?? ''
    const detalle = textoDetalle ? partir(medir, textoDetalle, anchoTexto, 2) : []
    // "Otra actividad en este horario": renglón propio bajo el detalle, tras su etiqueta.
    const textoOtra = actividad.otraActividad?.trim() ?? ''
    medir.font = `600 27px ${FUENTE}`
    const otra = textoOtra ? partir(medir, textoOtra, anchoTexto - anchoEtiqueta, 2) : []
    const minimo =
      24 +
      titulo.length * 44 +
      40 +
      detalle.length * 36 +
      (otra.length ? otra.length * 36 + 28 : 0) +
      20
    const duracion = toMinutes(actividad.horaFin) - toMinutes(actividad.horaInicio)
    const alto = Math.round(
      Math.min(Math.max(duracion * PX_POR_MINUTO, minimo), minimo * TOPE_ALTO)
    )
    const anterior = ordenadas[i - 1]
    const libre = anterior
      ? Math.max(0, toMinutes(actividad.horaInicio) - toMinutes(anterior.horaFin))
      : 0
    return { actividad, titulo, detalle, otra, alto, libre }
  })

  const encabezado = 380
  const pie = 110
  const cuerpo = renglones.length
    ? renglones.reduce(
        (suma, r) => suma + r.alto + SEPARACION + (r.libre ? altoLibre(r.libre) : 0),
        0
      )
    : 120
  canvas.height = encabezado + cuerpo + pie

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = COLOR.fondo
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textBaseline = 'top'

  // Encabezado: quién, qué día, si ya se envió y el día en una línea.
  ctx.fillStyle = COLOR.banda
  ctx.fillRect(0, 0, ANCHO, 14)
  ctx.fillStyle = COLOR.tenue
  ctx.font = `600 28px ${FUENTE}`
  ctx.fillText('AGENDA DEL DÍA', MARGEN, 64)
  ctx.fillStyle = COLOR.texto
  ctx.font = `700 50px ${FUENTE}`
  ctx.fillText(partir(ctx, agenda.auditorNombre, ANCHO - MARGEN * 2, 1)[0] ?? '', MARGEN, 108)
  ctx.font = `400 32px ${FUENTE}`
  ctx.fillStyle = COLOR.tenue
  ctx.fillText(fechaLarga(agenda.fecha), MARGEN, 178)
  ctx.font = `600 30px ${FUENTE}`
  ctx.fillStyle = agenda.status === 'enviada' ? '#15803d' : COLOR.aviso
  ctx.fillText(estado, MARGEN, 232)

  // Resumen: cuántas, de qué hora a qué hora y cuántas van hechas (como el avance de la vista).
  const total = `${activities.length} ${activities.length === 1 ? 'actividad' : 'actividades'}`
  if (ordenadas.length) {
    const hechas = activities.filter(
      (a) => a.cuentaEnCumplimiento !== false && DONE_STATUSES.includes(a.status)
    ).length
    const conOtra = activities.filter((a) => a.otraActividad?.trim()).length
    const fin = Math.max(...ordenadas.map((a) => toMinutes(a.horaFin)))
    const ultima = ordenadas.find((a) => toMinutes(a.horaFin) === fin)!
    ctx.font = `400 28px ${FUENTE}`
    ctx.fillStyle = COLOR.tenue
    ctx.fillText(
      `${total} · ${formatTime(ordenadas[0].horaInicio)} – ${formatTime(
        ultima.horaFin
      )} · ${hechas} ${hechas === 1 ? 'hecha' : 'hechas'}${
        conOtra ? ` · ${conOtra} con otra actividad` : ''
      }`,
      MARGEN,
      280
    )
  }

  ctx.fillStyle = COLOR.linea
  ctx.fillRect(MARGEN, encabezado - 24, ANCHO - MARGEN * 2, 2)

  let y = encabezado
  if (!renglones.length) {
    ctx.fillStyle = COLOR.tenue
    ctx.font = `400 30px ${FUENTE}`
    ctx.fillText('Sin actividades.', MARGEN, y + 30)
  }

  const riel = (desde: number, hasta: number, punteado: boolean) => {
    ctx.strokeStyle = COLOR.riel
    ctx.lineWidth = 3
    ctx.setLineDash(punteado ? [8, 8] : [])
    ctx.beginPath()
    ctx.moveTo(RIEL_X, desde)
    ctx.lineTo(RIEL_X, hasta)
    ctx.stroke()
    ctx.setLineDash([])
  }

  renglones.forEach(({ actividad, titulo, detalle, otra, alto, libre }, i) => {
    // Hueco antes de la actividad: tramo punteado con lo que queda libre.
    if (libre) {
      const tramo = altoLibre(libre)
      riel(y, y + tramo, true)
      ctx.fillStyle = COLOR.tenue
      ctx.font = `400 24px ${FUENTE}`
      ctx.textBaseline = 'middle'
      ctx.fillText(`libre ${formatDuration(libre)}`, TEXTO_X, y + tramo / 2)
      ctx.textBaseline = 'top'
      y += tramo
    }

    const punto = y + 24 + 20
    // El riel arranca en el primer punto y corre hasta el siguiente bloque o hueco.
    riel(i === 0 ? punto : y, y + alto + (i < renglones.length - 1 ? SEPARACION : 0), false)

    // Bloque con la barra del estado al borde izquierdo.
    ctx.fillStyle = COLOR.bloque
    ctx.fillRect(BLOQUE_X, y, ANCHO - MARGEN - BLOQUE_X, alto)
    ctx.fillStyle = COLOR_ESTADO[actividad.status] ?? COLOR.tenue
    ctx.fillRect(BLOQUE_X, y, 6, alto)

    // Punto en la hora de inicio, con la hora alineada a él y el fin debajo en gris.
    ctx.beginPath()
    ctx.arc(RIEL_X, punto, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = COLOR.texto
    ctx.font = `700 30px ${FUENTE}`
    ctx.textBaseline = 'middle'
    ctx.fillText(formatTime(actividad.horaInicio), MARGEN, punto)
    ctx.textBaseline = 'top'
    ctx.fillStyle = COLOR.tenue
    ctx.font = `400 26px ${FUENTE}`
    ctx.fillText(formatTime(actividad.horaFin), MARGEN, punto + 24)

    let fila = y + 24
    ctx.fillStyle = COLOR.texto
    ctx.font = `600 34px ${FUENTE}`
    for (const renglon of titulo) {
      ctx.fillText(renglon, TEXTO_X, fila)
      fila += 44
    }

    // Estado y lugar en un renglón: el estado primero, que es lo que el grupo busca.
    const etiqueta = STATUS_STYLE[actividad.status]?.label ?? actividad.status
    ctx.font = `600 27px ${FUENTE}`
    ctx.fillStyle = COLOR_ESTADO[actividad.status] ?? COLOR.tenue
    ctx.fillText(etiqueta, TEXTO_X, fila + 4)
    const lugar = lugarDe(actividad)
    if (lugar) {
      const desde = TEXTO_X + ctx.measureText(etiqueta).width
      ctx.font = `400 27px ${FUENTE}`
      ctx.fillStyle = COLOR.tenue
      ctx.fillText(`  ·  ${lugar}`, desde, fila + 4)
    }
    fila += 40

    ctx.font = `400 27px ${FUENTE}`
    ctx.fillStyle = COLOR.tenue
    for (const renglon of detalle) {
      ctx.fillText(renglon, TEXTO_X, fila)
      fila += 36
    }

    // Otra actividad: franja ámbar suave detrás del renglón, etiqueta y el texto en el peso
    // del título. Resalta sin cortar la lectura del bloque.
    if (otra.length) {
      const franja = fila + 4
      ctx.fillStyle = COLOR.avisoFondo
      ctx.fillRect(BLOQUE_X + 6, franja, ANCHO - MARGEN - BLOQUE_X - 6, otra.length * 36 + 16)
      ctx.fillStyle = COLOR.aviso
      ctx.font = `700 22px ${FUENTE}`
      ctx.fillText(ETIQUETA_OTRA, TEXTO_X, franja + 12)
      ctx.fillStyle = COLOR.texto
      ctx.font = `600 27px ${FUENTE}`
      otra.forEach((renglon, k) =>
        ctx.fillText(renglon, TEXTO_X + anchoEtiqueta, franja + 8 + k * 36)
      )
    }

    y += alto + SEPARACION
  })

  ctx.fillStyle = COLOR.tenue
  ctx.font = `400 24px ${FUENTE}`
  ctx.fillText(`${total} · ${marca}`, MARGEN, canvas.height - pie + 40)

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen.'))),
      'image/png'
    )
  )
}
