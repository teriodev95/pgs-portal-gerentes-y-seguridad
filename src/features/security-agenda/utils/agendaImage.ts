import { STATUS_STYLE, VISIT_ACTIVITY_TYPE } from '../constants'
import type { Agenda, AgendaActivity, AgendaActivityStatus } from '../types'
import { formatTime, toMinutes } from './time'

/**
 * PNG de la agenda del día, lista para mandarse al grupo de WhatsApp sin depender
 * del enlace. Se dibuja a mano en un canvas: es una lista de texto, y una librería
 * que fotografía el DOM pesaría más que todo esto y saldría distinta en cada celular.
 *
 * Nunca lleva el detalle de una visita de call center: ahí va `"<cliente> — <préstamo>"`,
 * y la imagen sale del sistema igual que el enlace público, que tampoco lo publica.
 */

const ANCHO = 1080
const MARGEN = 64
const COLUMNA_HORA = 190
const FUENTE = '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

const COLOR = {
  texto: '#111827',
  tenue: '#4b5563',
  linea: '#e5e7eb',
  fondo: '#ffffff',
  banda: '#1d4ed8'
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
  alto: number
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

  const anchoTexto = ANCHO - MARGEN * 2 - COLUMNA_HORA
  const ordenadas = [...activities].sort(
    (a, b) => toMinutes(a.horaInicio) - toMinutes(b.horaInicio)
  )

  // Primero se mide, para saber el alto; al cambiar el alto el canvas se reinicia.
  const renglones: Renglon[] = ordenadas.map((actividad) => {
    medir.font = `600 34px ${FUENTE}`
    const titulo = partir(medir, actividad.tipoNombre, anchoTexto, 2)
    medir.font = `400 27px ${FUENTE}`
    const textoDetalle =
      actividad.tipo === VISIT_ACTIVITY_TYPE ? '' : actividad.detalle?.trim() ?? ''
    const detalle = textoDetalle ? partir(medir, textoDetalle, anchoTexto, 2) : []
    const alto = 36 + titulo.length * 44 + 40 + detalle.length * 36 + 32
    return { actividad, titulo, detalle, alto }
  })

  const encabezado = 330
  const pie = 110
  const cuerpo = renglones.length ? renglones.reduce((suma, r) => suma + r.alto, 0) : 120
  canvas.height = encabezado + cuerpo + pie

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = COLOR.fondo
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textBaseline = 'top'

  // Encabezado: quién, qué día y si ya se envió.
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
  ctx.fillStyle = agenda.status === 'enviada' ? '#15803d' : '#b45309'
  ctx.fillText(estado, MARGEN, 232)

  ctx.fillStyle = COLOR.linea
  ctx.fillRect(MARGEN, encabezado - 24, ANCHO - MARGEN * 2, 2)

  let y = encabezado
  if (!renglones.length) {
    ctx.fillStyle = COLOR.tenue
    ctx.font = `400 30px ${FUENTE}`
    ctx.fillText('Sin actividades.', MARGEN, y + 30)
  }

  for (const { actividad, titulo, detalle, alto } of renglones) {
    const x = MARGEN + COLUMNA_HORA
    let fila = y + 36

    ctx.fillStyle = COLOR.texto
    ctx.font = `700 30px ${FUENTE}`
    ctx.fillText(formatTime(actividad.horaInicio), MARGEN, fila + 2)
    ctx.fillStyle = COLOR.tenue
    ctx.font = `400 26px ${FUENTE}`
    ctx.fillText(formatTime(actividad.horaFin), MARGEN, fila + 42)

    ctx.fillStyle = COLOR.texto
    ctx.font = `600 34px ${FUENTE}`
    for (const renglon of titulo) {
      ctx.fillText(renglon, x, fila)
      fila += 44
    }

    // Estado y lugar en un renglón: el estado primero, que es lo que el grupo busca.
    const etiqueta = STATUS_STYLE[actividad.status]?.label ?? actividad.status
    ctx.font = `600 27px ${FUENTE}`
    ctx.fillStyle = COLOR_ESTADO[actividad.status] ?? COLOR.tenue
    ctx.fillText(etiqueta, x, fila + 4)
    const lugar = lugarDe(actividad)
    if (lugar) {
      const desde = x + ctx.measureText(etiqueta).width
      ctx.font = `400 27px ${FUENTE}`
      ctx.fillStyle = COLOR.tenue
      ctx.fillText(`  ·  ${lugar}`, desde, fila + 4)
    }
    fila += 40

    ctx.font = `400 27px ${FUENTE}`
    ctx.fillStyle = COLOR.tenue
    for (const renglon of detalle) {
      ctx.fillText(renglon, x, fila)
      fila += 36
    }

    y += alto
    ctx.fillStyle = COLOR.linea
    ctx.fillRect(x, y - 2, ANCHO - MARGEN - x, 2)
  }

  ctx.fillStyle = COLOR.tenue
  ctx.font = `400 24px ${FUENTE}`
  const total = `${activities.length} ${activities.length === 1 ? 'actividad' : 'actividades'}`
  ctx.fillText(`${total} · ${marca}`, MARGEN, canvas.height - pie + 40)

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen.'))),
      'image/png'
    )
  )
}
