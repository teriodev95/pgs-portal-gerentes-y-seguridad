export type CashLevel = 'neutral' | 'green' | 'yellow' | 'pink' | 'red'

/** Los cuatro rangos replican el formato condicional del reporte Excel. */
export function getCashLevel(amount: number | null): CashLevel {
  if (amount == null || amount === 0) return 'neutral'
  if (amount < 0 || amount >= 30000) return 'red'
  if (amount >= 25000) return 'pink'
  if (amount >= 20000) return 'yellow'
  return 'green'
}

export function getCashStatus(amount: number | null): string {
  if (amount == null) return 'Sin captura'
  if (amount < 0) return 'Saldo negativo'

  return {
    neutral: 'Sin efectivo',
    green: 'Operación normal',
    yellow: 'Seguimiento',
    pink: 'Atención',
    red: 'Contactar'
  }[getCashLevel(amount)]
}

export function formatCurrency(amount: number | null): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatMexicoDateTime(value: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}
