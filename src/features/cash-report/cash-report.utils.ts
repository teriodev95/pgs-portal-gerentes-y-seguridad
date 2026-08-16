export type CashLevel = 'neutral' | 'green' | 'yellow' | 'pink' | 'red'

/**
 * El reporte se lee en pesos enteros, así que todo se decide sobre el mismo
 * peso que se muestra. Un residuo de centavos —un `-0.4` de redondeo— se
 * imprimía "-$0" y a la vez era menor que cero: la tarjeta enseñaba una cifra
 * en cero, la pintaba de rojo y ofrecía llamarle al gerente por ella.
 *
 * `Math.round(-0.4)` devuelve `-0`, que se formatea "-$0", así que el cero
 * negativo se normaliza aquí y no sobrevive a una cifra que ya es cero.
 */
function toPesos(amount: number): number {
  const rounded = Math.round(amount)
  return rounded === 0 ? 0 : rounded
}

/** Los cuatro rangos replican el formato condicional del reporte Excel. */
export function getCashLevel(amount: number | null): CashLevel {
  if (amount == null) return 'neutral'

  const pesos = toPesos(amount)
  if (pesos === 0) return 'neutral'
  if (pesos < 0 || pesos >= 30000) return 'red'
  if (pesos >= 25000) return 'pink'
  if (pesos >= 20000) return 'yellow'
  return 'green'
}

export function getCashStatus(amount: number | null): string {
  if (amount == null) return 'Sin captura'
  if (toPesos(amount) < 0) return 'Saldo negativo'

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
  }).format(toPesos(amount))
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
