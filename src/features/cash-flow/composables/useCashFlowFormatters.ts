const mxn = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function useCashFlowFormatters() {
  function formatMoney(value: number): string {
    return mxn.format(value)
  }

  return { formatMoney }
}
