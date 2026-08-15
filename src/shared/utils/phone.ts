const MOBILE_DIGITS = 10
const COUNTRY_CODE = '52'

export function phoneDigits(celular: string | null | undefined): string {
  return (celular ?? '').replace(/\D/g, '')
}

export function isDialable(celular: string | null | undefined): boolean {
  return phoneDigits(celular).length === MOBILE_DIGITS
}

export function formatPhone(celular: string | null | undefined): string {
  const digits = phoneDigits(celular)
  if (digits.length !== MOBILE_DIGITS) return (celular ?? '').trim()
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

export function telHref(celular: string): string {
  return `tel:${phoneDigits(celular)}`
}

export function whatsappHref(celular: string, message?: string): string {
  const base = `https://wa.me/${COUNTRY_CODE}${phoneDigits(celular)}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
