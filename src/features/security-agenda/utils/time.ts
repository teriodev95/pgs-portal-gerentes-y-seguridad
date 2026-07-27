import {
  CUTOFF_HOUR,
  CUTOFF_MINUTE,
  DAY_END_HOUR,
  DAY_START_HOUR,
  SLOT_MINUTES
} from '../constants'

/** `HH:MM` -> minutos desde medianoche. */
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

/** minutos desde medianoche -> `HH:MM`. */
export function toHHMM(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)))
  const hours = Math.floor(clamped / 60)
  const rest = clamped % 60
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

/** `13:30` -> `1:30 pm`. Formato único de la vista. */
export function formatTime(time: string): string {
  const minutes = toMinutes(time)
  const hours24 = Math.floor(minutes / 60)
  const rest = minutes % 60
  const suffix = hours24 < 12 ? 'am' : 'pm'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(rest).padStart(2, '0')} ${suffix}`
}

/** Etiqueta compacta del riel: `7 am`, `1 pm`. */
export function formatHourLabel(hour: number): string {
  const suffix = hour < 12 ? 'am' : 'pm'
  const hours12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hours12} ${suffix}`
}

export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function tomorrowISO(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toISODate(date)
}

export function isToday(fecha: string): boolean {
  return fecha === todayISO()
}

/** `2026-07-27` -> `27/07`. */
export function formatShortDate(fecha: string): string {
  const [, month, day] = fecha.split('-')
  return `${day}/${month}`
}

export function nowMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export function nowLabel(): string {
  const now = new Date()
  return formatTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`)
}

/** Minutos que faltan para el corte de la fecha dada (negativo si ya pasó). */
export function minutesToCutoff(fecha: string): number {
  const cutoff = new Date(`${fecha}T00:00:00`)
  cutoff.setHours(CUTOFF_HOUR, CUTOFF_MINUTE, 0, 0)
  return Math.round((cutoff.getTime() - Date.now()) / 60000)
}

/** `2026-07-27T06:58:00Z` -> `6:58 am`. */
export function formatTimestampTime(timestamp: string | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return formatTime(`${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`)
}

/** `Actualizado hace X` de la vista pública. */
export function formatRelative(timestamp: string | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''

  const minutes = Math.round((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'hace unos segundos'
  if (minutes === 1) return 'hace 1 minuto'
  if (minutes < 60) return `hace ${minutes} minutos`

  const hours = Math.round(minutes / 60)
  if (hours === 1) return 'hace 1 hora'
  if (hours < 24) return `hace ${hours} horas`

  const days = Math.round(hours / 24)
  return days === 1 ? 'hace 1 día' : `hace ${days} días`
}

/** Opciones del selector de horario, en bloques de 30 min. */
export function timeSlots(): string[] {
  const slots: string[] = []
  for (let minutes = DAY_START_HOUR * 60; minutes <= DAY_END_HOUR * 60; minutes += SLOT_MINUTES) {
    slots.push(toHHMM(minutes))
  }
  return slots
}
