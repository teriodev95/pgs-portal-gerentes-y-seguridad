// Funciones puras del recorrido, copiadas de MOX `modules/rastreo-gps/helpers.ts` (routeBands, routeEnds,
// shade, pointAge, isFresh) y adaptadas al contrato compacto de FAX para PGS (vértices como arreglos).
// Así PGS y MOX pintan idéntico: línea clara al inicio, oscura al final; huecos punteados sin unir.
import type { RecorridoHoy, Vertice } from './equipo-gps.types'

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
  const tracks = tramos.map((tramo) => tramo.puntos.filter(validVertex))
  const steps = tracks.map((points) => points.map((point, i) => (i ? meters(points[i - 1], point) : 0)))
  const total = steps.flat().reduce((sum, step) => sum + step, 0)
  const lines: { band: number; points: Position[] }[] = []
  let travelled = 0
  tracks.forEach((points, track) => {
    let line = undefined as (typeof lines)[number] | undefined
    points.forEach((point, i) => {
      travelled += steps[track][i]
      const band = total ? Math.min(bands - 1, Math.floor((travelled / total) * bands)) : bands - 1
      if (line?.band === band) line.points.push(position(point))
      else {
        const joint = line?.points[line.points.length - 1]
        line = { band, points: joint ? [joint, position(point)] : [position(point)] }
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

const clock = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Mexico_City',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})

export function formatTime(iso: string) {
  const at = Date.parse(iso)
  return Number.isFinite(at) ? clock.format(new Date(at)) : '--:--'
}

export function formatDistance(metersValue: number) {
  return metersValue >= 1000 ? `${(metersValue / 1000).toFixed(1)} km` : `${Math.round(metersValue)} m`
}

export function formatDuration(seconds: number) {
  const minutes = Math.round(Math.max(0, seconds) / 60)
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`
}
