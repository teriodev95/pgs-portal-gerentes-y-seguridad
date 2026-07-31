/**
 * Celulares del padrón de agentes, capturados a mano: el largo no está
 * garantizado —hay uno de 9 dígitos entre 289—. Un número incompleto se muestra
 * tal cual pero no se enlaza: un `wa.me` mal armado abre una conversación con
 * nadie, y eso se descubre después de haber escrito el mensaje.
 */

/** Un móvil mexicano en formato nacional: lada de 2 o 3 más el abonado. */
const MOBILE_DIGITS = 10

/**
 * Lada de México para `wa.me`, y sólo para `wa.me`.
 *
 * OJO: el gateway de mensajería (`correcciones.notify.ts` en xpress-elysia) usa
 * `521`. Ese 1 es una herencia del formato viejo de WhatsApp que hoy `wa.me`
 * rechaza; copiarlo aquí manda a un número que no existe.
 */
const COUNTRY_CODE = '52'

export function phoneDigits(celular: string | null | undefined): string {
  return (celular ?? '').replace(/\D/g, '')
}

/** Sólo con los 10 dígitos exactos se pintan los botones. */
export function isDialable(celular: string | null | undefined): boolean {
  return phoneDigits(celular).length === MOBILE_DIGITS
}

/**
 * `4431405588` → `443 140 5588`. Lo que no trae los 10 dígitos se devuelve como
 * se capturó: agruparlo sugeriría que está completo.
 */
export function formatPhone(celular: string | null | undefined): string {
  const digits = phoneDigits(celular)
  if (digits.length !== MOBILE_DIGITS) return (celular ?? '').trim()
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

/** El sistema operativo abre el marcador; aquí no hay integración telefónica. */
export function telHref(celular: string): string {
  return `tel:${phoneDigits(celular)}`
}

export function whatsappHref(celular: string): string {
  return `https://wa.me/${COUNTRY_CODE}${phoneDigits(celular)}`
}
