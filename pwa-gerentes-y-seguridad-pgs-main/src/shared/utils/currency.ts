/**
 * toCurrency
 * @param val
 * @returns
 */
export function toCurrency(val?: number) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  })

  return isNaN(Number(val)) ? formatter.format(0) : formatter.format(Number(val))
}

/**
 * fromCurrency
 * @param val
 * @returns
 */
export function fromCurrency(val?: string): number {
  const cleanString = val?.replace(/[^\d.]/g, '') || '0'
  const parsedNumber = parseFloat(cleanString)
  return isNaN(parsedNumber) ? 0 : parsedNumber
}
