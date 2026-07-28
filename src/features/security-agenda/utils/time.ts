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

/**
 * Zona de operación. El backend decide "hoy" y el corte de las 7:30 en
 * CDMX (`TZ_OPERACION`), así que la vista lee el reloj en la misma zona: con el
 * teléfono en otro huso o con la hora corrida, la agenda seguiría siendo la del
 * día que el servidor espera.
 */
const TZ_OPERACION = 'America/Mexico_City'

/** `en-CA` da directo `YYYY-MM-DD`. */
const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ_OPERACION,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

/** `en-GB` da directo `HH:MM` en formato de 24 horas. */
const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ_OPERACION,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})

/** Hora de pared de un instante en la zona de operación. */
function zonedHHMM(date: Date): string {
  return timeFormatter.format(date)
}

function addDays(fecha: string, days: number): string {
  const [year, month, day] = fecha.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

export function todayISO(): string {
  return dateFormatter.format(new Date())
}

export function tomorrowISO(): string {
  return addDays(todayISO(), 1)
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
  return toMinutes(zonedHHMM(new Date()))
}

/** Minutos que faltan para el corte de la fecha dada (negativo si ya pasó). */
export function minutesToCutoff(fecha: string): number {
  const dias =
    (Date.parse(`${fecha}T00:00:00Z`) - Date.parse(`${todayISO()}T00:00:00Z`)) / 86_400_000
  return dias * 24 * 60 + (CUTOFF_HOUR * 60 + CUTOFF_MINUTE) - nowMinutes()
}

/** `2026-07-27T12:58:00Z` -> `6:58 am` (hora de la zona de operación). */
export function formatTimestampTime(timestamp: string | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return formatTime(zonedHHMM(date))
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

/** Encaja un horario dentro de la jornada que acepta el backend. */
function clampToDay(minutes: number, duration: number): number {
  return Math.max(DAY_START_HOUR * 60, Math.min(minutes, DAY_END_HOUR * 60 - duration))
}

/**
 * Bloque de 30 min más cercano a un instante, en la zona de operación. Es la
 * hora con la que entra a la agenda una visita que ya se registró.
 */
export function slotFromTimestamp(timestamp: string, duration: number): string {
  const date = new Date(timestamp)
  const time = Number.isNaN(date.getTime()) ? zonedHHMM(new Date()) : zonedHHMM(date)
  const rounded = Math.round(toMinutes(time) / SLOT_MINUTES) * SLOT_MINUTES
  return toHHMM(clampToDay(rounded, duration))
}

/** Próximo bloque de 30 min a partir de ahora. */
export function nextSlot(duration: number): string {
  const rounded = Math.ceil(nowMinutes() / SLOT_MINUTES) * SLOT_MINUTES
  return toHHMM(clampToDay(rounded, duration))
}

/** Opciones del selector de horario, en bloques de 30 min. */
export function timeSlots(): string[] {
  const slots: string[] = []
  for (let minutes = DAY_START_HOUR * 60; minutes <= DAY_END_HOUR * 60; minutes += SLOT_MINUTES) {
    slots.push(toHHMM(minutes))
  }
  return slots
}
