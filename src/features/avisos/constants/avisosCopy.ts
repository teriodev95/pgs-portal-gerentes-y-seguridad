const relativeTime = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })

/** "hace 2 horas", "ayer"… como lo lee alguien que revisa el buzón de pasada. */
export function timeAgo(iso: string): string {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000)
  if (minutes > -60) return relativeTime.format(Math.min(minutes, -1), 'minute')
  const hours = Math.round(minutes / 60)
  if (hours > -24) return relativeTime.format(hours, 'hour')
  return relativeTime.format(Math.round(hours / 24), 'day')
}

const dayFormat = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

/** Encabezado del grupo del historial: Hoy, Ayer o "lunes 22 de septiembre". */
export function dayLabel(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Hoy'
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
  const label = dayFormat.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}
