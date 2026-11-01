// Funciones puras del recorrido, copiadas de MOX `modules/rastreo-gps/helpers.ts` (routeBands, routeEnds,
// shade, pointAge, isFresh) y adaptadas al contrato compacto de FAX para PGS (vértices como arreglos).
// Así PGS y MOX pintan idéntico: línea clara al inicio, oscura al final; huecos punteados sin unir.
import type { EstadoGerente, EventoDia, FiltroEquipo, GerenteEquipo, MarcadorMapa, Pista, RangoHoras, RecorridoHoy, Vertice } from './equipo-gps.types'
import { SUCURSALES } from './equipo-gps.constants'

export type Position = [number, number]

const time = (vertex: Vertice) => Date.parse(vertex[2])
const position = (vertex: Vertice): Position => [vertex[0], vertex[1]]

export function validVertex(vertex: Vertice): boolean {
  return (
    Number.isFinite(vertex[0]) &&
    Number.isFinite(vertex[1]) &&
    Math.abs(vertex[0]) <= 90 &&
    Math.abs(vertex[1]) <= 180
  )
}

/** Metros sobre el suelo entre dos capturas (haversine). */
export function meters(a: Vertice, b: Vertice): number {
  const rad = Math.PI / 180
  const dLat = (b[0] - a[0]) * rad
  const dLng = (b[1] - a[1]) * rad
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2
  return 12_742_017.6 * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Corta el recorrido en hasta `bands` pedazos por distancia recorrida: la línea va de clara a oscura a lo
 * largo de todo el viaje aunque el día empiece horas antes o tenga paradas largas. Cada pedazo arranca en
 * el último punto del anterior (sin costuras). Teléfonos distintos nunca se unen.
 */
export function routeBands(tramos: RecorridoHoy['tramos'], bands = 12) {
  // Con `ajustado` (OSRM) la línea del tramo es la calle: sus vértices no tienen hora ni estimados. Sin él, los
  // puntos del teléfono como hoy.
  const tracks = tramos.map((tramo) =>
    tramo.ajustado?.length
      ? tramo.ajustado.map(([lat, lon]) => [lat, lon, '', 0] as Vertice)
      : tramo.puntos.filter(validVertex)
  )
  const steps = tracks.map((points) => points.map((point, i) => (i ? meters(points[i - 1], point) : 0)))
  const total = steps.flat().reduce((sum, step) => sum + step, 0)
  const lines: { band: number; points: Position[]; estimated: boolean; seconds: number }[] = []
  let travelled = 0
  tracks.forEach((points, track) => {
    // Un tramo estimado (FAX no tuvo puntos en medio) es su propia pieza punteada en el color de la banda; la
    // línea sólida sigue en su otro extremo. Igual que MOX `routeBands`. Pegado a la calle no hay estimados.
    const estimated = new Map(
      tramos[track].ajustado?.length
        ? []
        : (tramos[track].estimado ?? []).map(([desde, hasta, segundos]) => [`${desde}|${hasta}`, segundos])
    )
    let line = undefined as (typeof lines)[number] | undefined
    points.forEach((point, i) => {
      travelled += steps[track][i]
      const band = total ? Math.min(bands - 1, Math.floor((travelled / total) * bands)) : bands - 1
      const seconds = i > 0 ? estimated.get(`${points[i - 1][2]}|${point[2]}`) : undefined
      const dashed = seconds !== undefined
      if (line && line.band === band && !line.estimated && !dashed) line.points.push(position(point))
      else {
        const joint = line?.points[line.points.length - 1]
        line = { band, points: joint ? [joint, position(point)] : [position(point)], estimated: dashed, seconds: seconds ?? 0 }
        lines.push(line)
      }
    })
  })
  return lines
}

/** Primera y última captura válida del día, venga del teléfono que venga. */
export function routeEnds(tramos: RecorridoHoy['tramos']) {
  let start: Vertice | null = null
  let end: Vertice | null = null
  for (const tramo of tramos)
    for (const vertex of tramo.puntos.filter(validVertex)) {
      if (!start || time(vertex) < time(start)) start = vertex
      if (!end || time(vertex) > time(end)) end = vertex
    }
  return start && end ? { start, end } : null
}

/** Cada hueco como segmento entre la última captura antes y la primera después: se dibuja punteado. */
export function gapLinks(recorrido: RecorridoHoy) {
  const vertices = recorrido.tramos
    .flatMap((tramo) => tramo.puntos.filter(validVertex))
    .sort((a, b) => time(a) - time(b))
  return recorrido.huecos.flatMap((hueco) => {
    const desde = Date.parse(hueco.desde)
    const hasta = Date.parse(hueco.hasta)
    const before = [...vertices].reverse().find((vertex) => time(vertex) <= desde)
    const after = vertices.find((vertex) => time(vertex) >= hasta)
    if (!before || !after) return []
    return [{ from: position(before), to: position(after), seconds: hueco.segundos }]
  })
}

function safeColor(value?: string) {
  return /^#[0-9a-f]{6}$/i.test(value ?? '') ? value! : '#2563eb'
}

/** El color de la persona a lo largo de la ruta: ~70 % blanco al inicio (t = 0), ~40 % del color al final (t = 1). */
export function shade(color: string, t: number) {
  const hex = safeColor(color)
  return `#${[1, 3, 5]
    .map((i) => {
      const value = parseInt(hex.slice(i, i + 2), 16)
      const light = value + (255 - value) * 0.7
      const dark = value * 0.4
      return Math.round(light + (dark - light) * Math.min(1, Math.max(0, t)))
        .toString(16)
        .padStart(2, '0')
    })
    .join('')}`
}

// Un latido cada ~5 min estando quieto: 10 min evita que una persona quieta parpadee a «antigua».
// Mismo umbral que FAX (`estado: activo`) y que MOX.
export const FRESH_MS = 600_000

export function isFresh(iso: string | null | undefined, now = Date.now()) {
  if (!iso) return false
  const at = Date.parse(iso)
  return now - at <= FRESH_MS && at <= now + 60_000
}

export function pointAge(value: string | null | undefined, now = Date.now()) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Sin ubicación'
  const seconds = Math.max(0, (now - Date.parse(value)) / 1000)
  if (seconds < 60) return 'Hace menos de 1 min'
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`
  return `Hace ${Math.floor(seconds / 86400)} d`
}

const HORA_FMT = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Mexico_City',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})

export function formatTime(iso: string) {
  const at = Date.parse(iso)
  return Number.isFinite(at) ? HORA_FMT.format(new Date(at)) : '--:--'
}

export function formatDistance(metersValue: number) {
  return metersValue >= 1000 ? `${(metersValue / 1000).toFixed(1)} km` : `${Math.round(metersValue)} m`
}

export function formatDuration(seconds: number) {
  const minutes = Math.round(Math.max(0, seconds) / 60)
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`
}

// --- Lista y panel: texto, orden y agrupación. Puras, sin Vue. ---

const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'da', 'do', 'dos', 'das'])

/** «MA. CARMEN TEPATZI SANCHEZ» → «Ma. Carmen Tepatzi Sanchez». Las mayúsculas sostenidas cansan la lectura. */
export function titleCase(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && MINUSCULAS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
}

/** Dos letras para el marcador del mapa: «Ana López» → «AL». */
export function initials(value: string | null | undefined): string {
  const parts = (value ?? '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '·'
  const first = parts[0].charAt(0)
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
  return (first + last).toUpperCase()
}

export function sucursalNombre(codigo: string | null | undefined): string {
  return (codigo && SUCURSALES[codigo]) || codigo || 'Sin sucursal'
}

/** «hace 1 min», «hace 2 h»: la antigüedad corta que va a la derecha de cada fila. */
export function agoShort(iso: string | null | undefined, now = Date.now()): string {
  if (!iso || !Number.isFinite(Date.parse(iso))) return ''
  const seconds = Math.max(0, (now - Date.parse(iso)) / 1000)
  if (seconds < 60) return 'ahora'
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`
  return `hace ${Math.floor(seconds / 86400)} d`
}

/** Texto del estado; siempre acompaña al color. */
export function estadoTexto(estado: EstadoGerente): string {
  switch (estado) {
    case 'activo':
      return 'Activa'
    case 'sin_senal':
      return 'Sin señal'
    case 'sin_hoy':
      return 'Sin ubicación hoy'
    case 'fuera_horario':
      return 'Fuera de horario'
    case 'sin_app':
      return 'Sin la app'
    case 'vacante':
      return 'Vacante'
  }
}

/** Para los filtros: lo que no es activo ni vacante cuenta como «sin señal» (no hay dónde ubicarlo hoy). */
export function esSinSenal(gerente: GerenteEquipo): boolean {
  return gerente.estado !== 'activo' && gerente.estado !== 'vacante'
}

export function pasaFiltro(gerente: GerenteEquipo, filtro: FiltroEquipo, busqueda: string): boolean {
  if (gerente.estado === 'vacante') return false
  if (filtro === 'activos' && gerente.estado !== 'activo') return false
  if (filtro === 'sin_senal' && !esSinSenal(gerente)) return false
  const q = busqueda.trim().toLowerCase()
  if (!q) return true
  return `${gerente.nombre ?? ''} ${gerente.gerencia} ${gerente.usuario ?? ''}`.toLowerCase().includes(q)
}

const registrado = (g: GerenteEquipo) => Date.parse(g.ubicacion?.registrado_at ?? '') || 0

/** Primero sin señal, empezando por quien lleva más tiempo; después los activos (los más recientes al final). */
export function ordenarGerentes(gerentes: GerenteEquipo[]): GerenteEquipo[] {
  return [...gerentes].sort((a, b) => {
    const grupo = (g: GerenteEquipo) => (g.estado === 'sin_app' ? 0 : g.estado === 'sin_hoy' || g.estado === 'fuera_horario' ? 1 : g.estado === 'sin_senal' ? 2 : 3)
    const ga = grupo(a)
    const gb = grupo(b)
    if (ga !== gb) return ga - gb
    if (ga === 2 || ga === 3) return registrado(a) - registrado(b)
    return (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es')
  })
}

export interface GrupoSucursal {
  codigo: string
  nombre: string
  gerentes: GerenteEquipo[]
}

/** Grupos por sucursal en el orden fijo de la empresa, cada uno ya filtrado y ordenado. */
export function agruparPorSucursal(
  gerentes: GerenteEquipo[],
  filtro: FiltroEquipo,
  busqueda: string,
  sucursal: string | null = null
): GrupoSucursal[] {
  const orden = Object.keys(SUCURSALES)
  const porCodigo = new Map<string, GerenteEquipo[]>()
  for (const g of gerentes) {
    if (!pasaFiltro(g, filtro, busqueda) || !pasaSucursal(g, sucursal)) continue
    const codigo = g.sucursal ?? '—'
    if (!porCodigo.has(codigo)) porCodigo.set(codigo, [])
    porCodigo.get(codigo)!.push(g)
  }
  return [...porCodigo.entries()]
    .sort(([a], [b]) => (orden.indexOf(a) + 1 || 99) - (orden.indexOf(b) + 1 || 99))
    .map(([codigo, lista]) => ({ codigo, nombre: sucursalNombre(codigo), gerentes: ordenarGerentes(lista) }))
}

export function telUrl(telefono: string): string {
  return `tel:+52${telefono}`
}

export function whatsappUrl(telefono: string): string {
  return `https://wa.me/52${telefono}`
}

/** La línea del día del panel abierto: Inicio, cada parada con su duración, los huecos en gris y el Fin. */
export function lineaDelDia(recorrido: RecorridoHoy, enVivo: boolean): EventoDia[] {
  const ends = routeEnds(recorrido.tramos)
  if (!ends) return []
  const eventos: (EventoDia & { at: number })[] = [
    { tipo: 'inicio', titulo: 'Inicio', detalle: formatTime(ends.start[2]), lugar: [ends.start[0], ends.start[1]], at: time(ends.start) }
  ]
  recorrido.paradas.forEach((parada, index) => {
    eventos.push({
      tipo: 'parada',
      titulo: `Parada ${index + 1}`,
      detalle: `${formatTime(parada.inicio)} · ${formatDuration(parada.segundos)}`,
      lugar: [parada.lat, parada.lon],
      at: Date.parse(parada.inicio)
    })
  })
  for (const hueco of recorrido.huecos) {
    eventos.push({
      tipo: 'hueco',
      titulo: 'Sin ubicación',
      detalle: `${formatTime(hueco.desde)} · ${formatDuration(hueco.segundos)}`,
      lugar: null,
      at: Date.parse(hueco.desde)
    })
  }
  eventos.push({
    tipo: 'fin',
    titulo: enVivo ? 'Último punto' : 'Fin',
    detalle: formatTime(ends.end[2]),
    lugar: [ends.end[0], ends.end[1]],
    at: time(ends.end) + 1
  })
  return eventos.sort((a, b) => a.at - b.at).map(({ at: _at, ...evento }) => evento)
}

// --- Colores de Oficina: la misma regla que el monitor de MOX. ---
// Copia de MOX `modules/shared/utils/sucursal-color.ts` (hex) y `defaultAppearance` de `rastreo-gps/helpers.ts`:
// tomados del reporte impreso de Dirección; GoCash y DEC no tienen color de marca y caen a Pizarra.
const COLOR_SUCURSAL: Record<string, string> = {
  GERE: '#16a34a', // efectivo
  GERD: '#d97706', // dinero
  GERC: '#0891b2', // capital
  GERM: '#78350f', // moneda
  GERP: '#71717a' // plata
}
const NEUTRO = '#cbd5e1'
const PIZARRA = '#334155'

/** Color de marca de una sucursal (`GERE`…); sin color definido, neutro. Igual que MOX `getSucursalColor(...).hex`. */
export function getSucursalColor(sucursal: string | null | undefined): string {
  return COLOR_SUCURSAL[sucursal ?? ''] ?? NEUTRO
}

/** El color del marcador: el que Oficina guardó en MOX o, si no, el de la sucursal; neutro → Pizarra (como MOX). */
export function colorDe(gerente: Pick<GerenteEquipo, 'color' | 'sucursal'>): string {
  if (gerente.color && /^#[0-9a-f]{6}$/i.test(gerente.color)) return gerente.color
  const propio = getSucursalColor(gerente.sucursal)
  return propio === NEUTRO ? PIZARRA : propio
}

/** El color mezclado con blanco (t = 0.55 deja el 45 % del color): el «sin señal» sin depender de color-mix(). */
export function conBlanco(hex: string, t: number): string {
  return `#${[1, 3, 5]
    .map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16)
      return Math.round(v + (255 - v) * Math.min(1, Math.max(0, t))).toString(16).padStart(2, '0')
    })
    .join('')}`
}

// --- Marcadores encimados: agrupar por cercanía en pantalla, sin librería. ---
/** Proyección Web Mercator a píxeles para un zoom dado (la misma de Leaflet, 256 px por tesela). */
export function proyectar(lat: number, lon: number, zoom: number): [number, number] {
  const escala = 256 * 2 ** zoom
  const x = ((lon + 180) / 360) * escala
  const seno = Math.sin((lat * Math.PI) / 180)
  const y = (0.5 - Math.log((1 + seno) / (1 - seno)) / (4 * Math.PI)) * escala
  return [x, y]
}

/**
 * Agrupa a quienes caerían a menos de `radioPx` entre sí en el zoom actual (greedy, de norte a sur): los
 * marcadores no se enciman y el grupo dice «+N». Con 40 personas es inmediato.
 */
export function agruparMarcadores(gerentes: GerenteEquipo[], zoom: number, radioPx = 36): MarcadorMapa[] {
  const puntos = gerentes
    .filter((g) => g.ubicacion && g.id !== null)
    .map((g) => ({ g, p: proyectar(g.ubicacion!.lat, g.ubicacion!.lon, zoom) }))
    .sort((a, b) => a.p[1] - b.p[1])
  const grupos: { x: number; y: number; items: typeof puntos }[] = []
  for (const punto of puntos) {
    const cerca = grupos.find((grupo) => Math.hypot(grupo.x - punto.p[0], grupo.y - punto.p[1]) < radioPx)
    if (cerca) cerca.items.push(punto)
    else grupos.push({ x: punto.p[0], y: punto.p[1], items: [punto] })
  }
  return grupos.map((grupo) => ({
    lat: grupo.items.reduce((s, i) => s + i.g.ubicacion!.lat, 0) / grupo.items.length,
    lon: grupo.items.reduce((s, i) => s + i.g.ubicacion!.lon, 0) / grupo.items.length,
    gerentes: grupo.items.map((i) => i.g)
  }))
}

/** Filtro por sucursal además del de estado; `null` = todas. */
export function pasaSucursal(gerente: GerenteEquipo, sucursal: string | null): boolean {
  return !sucursal || gerente.sucursal === sucursal
}

const FILTRO_KEY = 'equipo-gps-filtro'

/** El filtro elegido sobrevive a cerrar la app; el almacenamiento puede fallar (privado, lleno) y no pasa nada. */
export function leerFiltroGuardado(): { estado: FiltroEquipo; sucursal: string | null } | null {
  try {
    const raw = localStorage.getItem(FILTRO_KEY)
    if (!raw) return null
    const value = JSON.parse(raw)
    const estado: FiltroEquipo = ['todos', 'activos', 'sin_senal'].includes(value?.estado) ? value.estado : 'todos'
    return { estado, sucursal: typeof value?.sucursal === 'string' ? value.sucursal : null }
  } catch {
    return null
  }
}

export function guardarFiltro(estado: FiltroEquipo, sucursal: string | null) {
  try {
    localStorage.setItem(FILTRO_KEY, JSON.stringify({ estado, sucursal }))
  } catch {
    /* sin almacenamiento: el filtro vive sólo en la sesión */
  }
}

// --- Paradas en el mapa: tamaños y «las más largas», copiados de MOX (stopSize, longestStops). ---
/** 0: menos de 15 min · 1: de 15 a 60 · 2: más de 60. */
export function stopSize(seconds: number): 0 | 1 | 2 {
  return seconds < 900 ? 0 : seconds <= 3600 ? 1 : 2
}
/** Diámetro en px por tamaño: sutil, sin competir con la línea. */
export const STOP_PX = [16, 20, 24] as const

/** Índices de las `count` paradas más largas; en empate gana la anterior. */
export function longestStops(stops: { segundos: number }[], count = 2): number[] {
  return stops
    .map((stop, index) => ({ index, seconds: stop.segundos }))
    .sort((a, b) => b.seconds - a.seconds || a.index - b.index)
    .slice(0, count)
    .map((item) => item.index)
}

/**
 * Qué paradas se dibujan en este zoom: si dos se enciman en pantalla (a menos de `radioPx`), sólo la más larga.
 * Devuelve los índices originales, para que el número coincida con «Parada N».
 */
export function paradasVisibles(paradas: RecorridoHoy['paradas'], zoom: number, radioPx = 18): number[] {
  const orden = paradas.map((p, index) => ({ index, p, xy: proyectar(p.lat, p.lon, zoom) })).sort((a, b) => b.p.segundos - a.p.segundos)
  const puestas: typeof orden = []
  for (const item of orden) {
    if (!puestas.some((q) => Math.hypot(q.xy[0] - item.xy[0], q.xy[1] - item.xy[1]) < radioPx)) puestas.push(item)
  }
  return puestas.map((item) => item.index).sort((a, b) => a - b)
}

/** La sucursal con más gerentes en un grupo «+N»: su color va en el anillo. */
export function sucursalMayoritaria(gerentes: Pick<GerenteEquipo, 'sucursal'>[]): string | null {
  const cuenta = new Map<string, number>()
  for (const g of gerentes) if (g.sucursal) cuenta.set(g.sucursal, (cuenta.get(g.sucursal) ?? 0) + 1)
  let mejor: string | null = null
  for (const [codigo, n] of cuenta) if (mejor === null || n > (cuenta.get(mejor) ?? 0)) mejor = codigo
  return mejor
}

/** «Detenido desde 11:20 · 25 min» / «En movimiento» / «Sin señal» para la ficha del mapa. */
export function textoAhora(ahora: { estado: string; desde: string | null; segundos: number | null }): string {
  switch (ahora.estado) {
    case 'detenido':
      return `Detenido desde ${ahora.desde ? formatTime(ahora.desde) : '—'} · ${formatDuration(ahora.segundos ?? 0)}`
    case 'en_movimiento':
      return 'En movimiento'
    case 'sin_senal':
      return 'Sin señal'
    default:
      return 'Sin datos hoy'
  }
}

// --- Horas y días del recorrido: ports de MOX (hourBounds, sliceDay, dayActivity, clock, dayLabel). ---
const QUARTER = 15 * 60_000

/** «13:15» para un instante (epoch ms), hora de México. */
export const clock = (ms: number) => formatTime(new Date(ms).toISOString())

/** Escala del deslizador: cuartos de hora alrededor de la primera y la última captura, más esas dos. */
export function hourBounds(recorrido: RecorridoHoy) {
  const ends = routeEnds(recorrido.tramos)
  if (!ends) return null
  const min = Math.floor(time(ends.start) / QUARTER) * QUARTER
  const max = Math.max(min + QUARTER, Math.ceil(time(ends.end) / QUARTER) * QUARTER)
  return { min, max, step: QUARTER, ...ends }
}

/**
 * El día recortado a unas horas con sus propias reglas: sus puntos, las paradas y huecos que las tocan, los tramos
 * estimados cuyos dos extremos siguen, y la distancia sumada dentro de cada tramo (ya filtrado por FAX).
 */
export function sliceDay(recorrido: RecorridoHoy, horas: RangoHoras): RecorridoHoy {
  const to = horas.to ?? Infinity
  const inside = (vertex: Vertice) => time(vertex) >= horas.from && time(vertex) <= to
  const touches = (start: string, end: string) => Date.parse(end) >= horas.from && Date.parse(start) <= to
  const tramos = recorrido.tramos
    .map((tramo) => {
      const puntos = tramo.puntos.filter(inside)
      const kept = new Set(puntos.map((v) => v[2]))
      // La línea pegada a la calle no tiene horas: sólo sigue si el tramo entra completo en el rango.
      const ajustado = puntos.length === tramo.puntos.length ? tramo.ajustado : undefined
      return {
        puntos,
        estimado: (tramo.estimado ?? []).filter(([desde, hasta]) => kept.has(desde) && kept.has(hasta)),
        ...(ajustado ? { ajustado } : {}),
      }
    })
    .filter((tramo) => tramo.puntos.length)
  const paradas = recorrido.paradas.filter((p) => touches(p.inicio, p.fin))
  let distancia_m = 0
  let puntos = 0
  for (const tramo of tramos) {
    const valid = tramo.puntos.filter(validVertex)
    puntos += valid.length
    for (let i = 1; i < valid.length; i++) distancia_m += meters(valid[i - 1], valid[i])
  }
  return {
    ...recorrido,
    tramos,
    paradas,
    huecos: recorrido.huecos.filter((h) => touches(h.desde, h.hasta)),
    resumen: { distancia_m, puntos, paradas: paradas.length },
    ajustado: tramos.some((tramo) => tramo.ajustado?.length)
  }
}

/** La tira de actividad: cuándo se movió cada teléfono, las paradas encima y los huecos sin ubicación. */
export function dayActivity(recorrido: RecorridoHoy) {
  const blocks: { from: number; to: number; kind: 'move' | 'stop' | 'gap' }[] = []
  for (const tramo of recorrido.tramos) {
    const ends = routeEnds([tramo])
    if (ends) blocks.push({ from: time(ends.start), to: time(ends.end), kind: 'move' })
  }
  for (const p of recorrido.paradas) blocks.push({ from: Date.parse(p.inicio), to: Date.parse(p.fin), kind: 'stop' })
  for (const h of recorrido.huecos) blocks.push({ from: Date.parse(h.desde), to: Date.parse(h.hasta), kind: 'gap' })
  return blocks
}

/** «Jue 30» para una fecha AAAA-MM-DD (día de México, sin correrse de día). */
export function dayLabelCorto(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  const texto = new Intl.DateTimeFormat('es-MX', { timeZone: 'UTC', weekday: 'short', day: 'numeric' }).format(new Date(Date.UTC(y, m - 1, d)))
  const limpio = texto.replace('.', '').replace(',', '')
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

/** Hoy en México como AAAA-MM-DD. */
export function hoyMexico(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** «09:00» de un día de México → epoch ms; inválido → null. */
export function horaAEpoch(fecha: string, hhmm: string | null | undefined): number | null {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return null
  const [h, m] = hhmm.split(':').map(Number)
  if (h > 23 || m > 59) return null
  // Octubre–marzo México es UTC-6 sin horario de verano; se calcula contra el día local real.
  const base = Date.parse(`${fecha}T00:00:00-06:00`)
  return base + (h * 60 + m) * 60_000
}

/** Epoch ms → «09:00» en hora de México, para la URL. */
export const epochAHora = (ms: number) => clock(ms)

/** Las pistas del navegador: Inicio, cada parada en orden y el Fin / Último punto. */
export function pistas(recorrido: RecorridoHoy, enVivo: boolean): Pista[] {
  const ends = routeEnds(recorrido.tramos)
  if (!ends) return []
  const lista: Pista[] = [
    { tipo: 'inicio', titulo: 'Inicio', detalle: formatTime(ends.start[2]), lugar: [ends.start[0], ends.start[1]], parada: null }
  ]
  recorrido.paradas.forEach((p, index) => {
    lista.push({
      tipo: 'parada',
      titulo: `Parada ${index + 1} de ${recorrido.paradas.length}`,
      detalle: `${formatTime(p.inicio)} · ${formatDuration(p.segundos)}`,
      lugar: [p.lat, p.lon],
      parada: index
    })
  })
  lista.push({ tipo: 'fin', titulo: enVivo ? 'Último punto' : 'Fin', detalle: formatTime(ends.end[2]), lugar: [ends.end[0], ends.end[1]], parada: null })
  return lista
}

const SOLO_PARADAS_KEY = 'equipo-gps-solo-paradas'

/** «Solo paradas» se recuerda por persona; el almacenamiento puede fallar y no pasa nada. */
export function leerSoloParadas(gerenteId: number): boolean {
  try {
    const raw = localStorage.getItem(SOLO_PARADAS_KEY)
    return raw ? Boolean(JSON.parse(raw)?.[String(gerenteId)]) : false
  } catch {
    return false
  }
}

export function guardarSoloParadas(gerenteId: number, valor: boolean) {
  try {
    const raw = localStorage.getItem(SOLO_PARADAS_KEY)
    const todo = raw ? JSON.parse(raw) : {}
    todo[String(gerenteId)] = valor
    localStorage.setItem(SOLO_PARADAS_KEY, JSON.stringify(todo))
  } catch {
    /* sin almacenamiento */
  }
}

// --- Horas de paso (v6): marcas de reloj sobre la línea y «¿A qué hora pasó por aquí?». Puras, en píxeles del zoom. ---
// `passesNear`, `passLabel` y `spread` son puertos de MOX `modules/rastreo-gps/helpers.ts`.

export interface Pixel {
  x: number
  y: number
}
export interface Rect {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** Un instante del día sobre la línea dibujada, en píxeles de un zoom. */
export interface PuntoHora extends Pixel {
  tramo: number
  /** Avance en píxeles sobre la línea de su tramo. */
  s: number
  time: number
  lat: number
  lon: number
  /** Un fijo real del teléfono (`recorded_at`); los demás se intercalan para el toque, con hora interpolada. */
  real: boolean
  /** Está sobre la línea sólida: a los lados de un tramo estimado no va marca. */
  solido: boolean
}

export const ZOOM_HORAS = 15
export const HORAS_SEPARACION_PX = 150
export const HORAS_MAX = 8
export const HORAS_MARGEN_PX = 40

/** Inversa de `proyectar`. */
export function desproyectar(x: number, y: number, zoom: number): [number, number] {
  const escala = 256 * 2 ** zoom
  const n = Math.PI - (2 * Math.PI * y) / escala
  return [(180 / Math.PI) * Math.atan(Math.sinh(n)), (x / escala) * 360 - 180]
}

function acumulado(linea: Pixel[]) {
  const L = [0]
  for (let i = 1; i < linea.length; i++) L.push(L[i - 1] + Math.hypot(linea[i].x - linea[i - 1].x, linea[i].y - linea[i - 1].y))
  return L
}

/** El punto de la línea a `s` píxeles del inicio (búsqueda binaria, como MOX `pathArrows`). */
function enAvance(linea: Pixel[], L: number[], s: number): Pixel {
  if (linea.length < 2) return linea[0]
  const objetivo = Math.min(L[L.length - 1], Math.max(0, s))
  let i = 1
  let alto = L.length - 1
  while (i < alto) {
    const medio = (i + alto) >> 1
    if (L[medio] < objetivo) i = medio + 1
    else alto = medio
  }
  const paso = L[i] - L[i - 1] || 1
  const t = (objetivo - L[i - 1]) / paso
  return { x: linea[i - 1].x + (linea[i].x - linea[i - 1].x) * t, y: linea[i - 1].y + (linea[i].y - linea[i - 1].y) * t }
}

/**
 * Avance sobre la línea del primer lugar, desde el segmento `desde` y nunca antes de `sMin`, que queda a menos de
 * `tol` px de `p`: el mínimo local más temprano, no el más cercano de toda la línea. La calle sigue el orden del día y
 * una ida y vuelta pasa dos veces por el mismo sitio: tomar el más cercano saltaría a la vuelta (o regresaría a la
 * ida). `null` si la línea no pasa cerca del punto.
 */
function avanceCercano(p: Pixel, linea: Pixel[], L: number[], desde: number, tol: number, sMin: number) {
  let mejor = Infinity
  let mejorS = 0
  let mejorJ = -1
  for (let j = Math.max(1, desde); j < linea.length; j++) {
    if (L[j] < sMin) continue
    const a = linea[j - 1]
    const dx = linea[j].x - a.x
    const dy = linea[j].y - a.y
    const largo = Math.hypot(dx, dy)
    let t = largo ? Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (largo * largo))) : 0
    if (largo && L[j - 1] + largo * t < sMin) t = (sMin - L[j - 1]) / largo
    const d = Math.hypot(a.x + dx * t - p.x, a.y + dy * t - p.y)
    if (d < mejor) [mejor, mejorS, mejorJ] = [d, L[j - 1] + largo * t, j]
    else if (mejor <= tol && j - mejorJ > 3) break
  }
  return mejor <= tol ? { s: mejorS, j: mejorJ } : null
}

/** Metros que mide un píxel en ese zoom y latitud (Web Mercator). */
const metrosPorPx = (lat: number, zoom: number) => (156_543.03 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom

/** Un fijo a más de esto de la calle dibujada no se pone sobre ella (OSRM lo dejó fuera o la línea terminó antes). */
const TOLERANCIA_CALLE_M = 80

/**
 * Los fijos reales de cada tramo proyectados al zoom y puestos sobre la línea dibujada: con `ajustado` (OSRM) en el
 * punto más cercano de la calle; sin él, en el fijo mismo. Entre fijos consecutivos de la línea sólida se intercalan
 * puntos cada `pasoPx` con la hora interpolada, para que el toque sobre la ruta siempre tenga uno cerca (los fijos del
 * monitor vienen a ~500 m). Un fijo lejos de la calle dibujada queda en su sitio, sin marca ni intercalados.
 * Se calcula una vez por zoom y por día, nunca en cada cuadro.
 */
export function puntosDeHora(tramos: RecorridoHoy['tramos'], zoom: number, pasoPx = 40): PuntoHora[] {
  const salida: PuntoHora[] = []
  tramos.forEach((tramo, k) => {
    const fijos = tramo.puntos.filter(validVertex)
    if (!fijos.length) return
    const pix = fijos.map((v) => {
      const [x, y] = proyectar(v[0], v[1], zoom)
      return { x, y }
    })
    const calle = Boolean(tramo.ajustado && tramo.ajustado.length > 1)
    const linea = calle
      ? tramo.ajustado!.map(([lat, lon]) => {
          const [x, y] = proyectar(lat, lon, zoom)
          return { x, y }
        })
      : pix
    const L = acumulado(linea)
    const estimado = new Set(calle ? [] : (tramo.estimado ?? []).map(([desde, hasta]) => `${desde}|${hasta}`))
    const estimadoEntre = (i: number) => estimado.has(`${fijos[i - 1][2]}|${fijos[i][2]}`)
    const tol = calle ? TOLERANCIA_CALLE_M / metrosPorPx(fijos[0][0], zoom) : Infinity
    let j = 1
    let sAnterior = 0
    let anteriorEnCalle = false
    fijos.forEach((v, i) => {
      let s = L[i] ?? 0
      let enCalle = true
      if (calle) {
        const cerca = avanceCercano(pix[i], linea, L, j, tol, sAnterior)
        enCalle = cerca !== null
        if (cerca) {
          s = Math.max(sAnterior, cerca.s)
          j = cerca.j
        } else s = sAnterior
      }
      const pos = calle && enCalle ? enAvance(linea, L, s) : pix[i]
      const [lat, lon] = calle && enCalle ? desproyectar(pos.x, pos.y, zoom) : [v[0], v[1]]
      const solidoAntes = enCalle && i > 0 && !estimadoEntre(i)
      const solidoDespues = enCalle && i < fijos.length - 1 && !estimadoEntre(i + 1)
      const time = Date.parse(v[2])
      const anterior = salida[salida.length - 1]
      if (solidoAntes && anteriorEnCalle && anterior && anterior.tramo === k && s - anterior.s > pasoPx)
        for (let si = anterior.s + pasoPx; si < s - pasoPx / 2; si += pasoPx) {
          const p = enAvance(linea, L, si)
          const [la, lo] = desproyectar(p.x, p.y, zoom)
          const t = anterior.time + ((si - anterior.s) / (s - anterior.s)) * (time - anterior.time)
          salida.push({ x: p.x, y: p.y, tramo: k, s: si, time: t, lat: la, lon: lo, real: false, solido: true })
        }
      salida.push({ x: pos.x, y: pos.y, tramo: k, s, time, lat, lon, real: true, solido: solidoAntes || solidoDespues })
      sAnterior = s
      anteriorEnCalle = enCalle
    })
  })
  return salida
}

/**
 * Las marcas de reloj que se ven: desde zoom 15, sólo fijos reales de la línea sólida dentro de `vista`, a ≥ 150 px
 * en pantalla de cualquier otra marca (si la ruta pasa dos veces por un lugar queda una sola) y a ≥ 40 px de las
 * paradas y de Inicio/Fin (`protegidos`; cada uno puede pedir más radio `r`, p. ej. los que llevan etiqueta fija;
 * se cuida también el texto a la derecha del punto); como mucho 8, repartidas. Se recalcula al terminar de mover o
 * de hacer zoom.
 */
export function marcasDeHora(
  puntos: PuntoHora[],
  zoom: number,
  vista: Rect,
  protegidos: (Pixel & { r?: number })[],
  separacion = HORAS_SEPARACION_PX,
  max = HORAS_MAX,
  margen = HORAS_MARGEN_PX
): PuntoHora[] {
  if (zoom < ZOOM_HORAS) return []
  const marcas: PuntoHora[] = []
  for (const p of puntos) {
    if (!p.real || !p.solido) continue
    if (p.x < vista.minX || p.x > vista.maxX || p.y < vista.minY || p.y > vista.maxY) continue
    if (protegidos.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < (q.r ?? margen) || Math.hypot(q.x - p.x - 28, q.y - p.y) < (q.r ?? margen))) continue
    if (marcas.some((m) => Math.hypot(m.x - p.x, m.y - p.y) < separacion)) continue
    marcas.push(p)
  }
  return spread(marcas, max)
}

/** Se queda con `max` elementos repartidos parejo: una ruta larga nunca llena la pantalla. */
export function spread<T>(items: T[], max: number) {
  if (items.length <= max) return items
  return Array.from({ length: max }, (_, i) => items[Math.floor((i * items.length) / max)])
}

/**
 * Cuándo pasó la ruta por el lugar más cercano a `target` (píxeles del zoom actual). `track` debe venir en orden de
 * tiempo. Los puntos a menos de `radius` de ese lugar forman una sola pasada mientras estén a menos de `gapMs` entre
 * sí (una parada o un cruce lento); volver más tarde cuenta aparte. Cada pasada reporta su punto más cercano al lugar.
 */
export function passesNear<T extends Pixel & { time: number }>(track: T[], target: Pixel, radius = 20, gapMs = 600_000) {
  let nearest: T | undefined
  let best = Infinity
  for (const point of track) {
    const gap = Math.hypot(point.x - target.x, point.y - target.y)
    if (gap < best) [best, nearest] = [gap, point]
  }
  if (!nearest) return null
  const passes: { point: T; distance: number; last: number }[] = []
  for (const point of track) {
    const distance = Math.hypot(point.x - nearest.x, point.y - nearest.y)
    if (distance > radius) continue
    const current = passes[passes.length - 1]
    if (current && point.time - current.last <= gapMs) {
      current.last = point.time
      if (distance < current.distance) Object.assign(current, { point, distance })
    } else passes.push({ point, distance, last: point.time })
  }
  return { at: nearest, passes: passes.map((pass) => pass.point) }
}

/** «Pasó a las 14:52 y a las 17:20». */
export function passLabel(times: string[]) {
  const parts = times.map((value) => `a las ${value}`)
  const last = parts.pop()
  return `Pasó ${parts.length ? `${parts.join(', ')} y ` : ''}${last ?? ''}`
}
