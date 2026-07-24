// Calendario Xpress: las semanas corren de MIÉRCOLES a MARTES (el miércoles
// es el día de pago). Aritmética pura sobre la fecha de cualquier pago de la
// semana — sin backend ni tabla calendario.

const MS_DIA = 24 * 60 * 60 * 1000

export interface RangoSemana {
  desde: Date
  hasta: Date
}

function mesCorto(fecha: Date): string {
  return new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(fecha).replace('.', '')
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** El miércoles que abre la semana Xpress a la que pertenece la fecha */
export function miercolesDeSemana(fecha: Date): Date {
  const d = new Date(fecha)
  d.setHours(12, 0, 0, 0)
  const offset = (d.getDay() - 3 + 7) % 7 // getDay(): 0=dom … 3=mié
  return new Date(d.getTime() - offset * MS_DIA)
}

export function rangoSemana(fechaPago: string | Date): RangoSemana | null {
  const fecha = new Date(fechaPago)
  if (isNaN(fecha.getTime())) return null
  const desde = miercolesDeSemana(fecha)
  return { desde, hasta: new Date(desde.getTime() + 6 * MS_DIA) }
}

/** "22 – 28 jul" · cruzando mes: "29 jul – 4 ago" (el año vive en el
 *  separador de mes, no aquí) */
export function formatoRango(rango: RangoSemana): string {
  const { desde, hasta } = rango
  if (desde.getMonth() === hasta.getMonth()) {
    return `${desde.getDate()} – ${hasta.getDate()} ${mesCorto(desde)}`
  }
  return `${desde.getDate()} ${mesCorto(desde)} – ${hasta.getDate()} ${mesCorto(hasta)}`
}

/** "JULIO 2026" — mes/año del miércoles inicial (regla estable para semanas
 *  que cruzan mes o año) */
export function etiquetaMes(rango: RangoSemana): string {
  const mes = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(rango.desde)
  return `${mes.toUpperCase()} ${rango.desde.getFullYear()}`
}

/** "Jueves 23 jul" — el día nominal cuenta la puntualidad sin explicarla */
export function diaNominal(fecha: string | Date): string {
  const d = new Date(fecha)
  if (isNaN(d.getTime())) return ''
  const dia = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(d)
  return `${capitalizar(dia)} ${d.getDate()} ${mesCorto(d)}`
}

/** "Jueves 23 de julio de 2026" — para encabezados de detalle */
export function fechaLarga(fecha: string | Date): string {
  const d = new Date(fecha)
  if (isNaN(d.getTime())) return String(fecha)
  const dia = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(d)
  const mes = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(d)
  return `${capitalizar(dia)} ${d.getDate()} de ${mes} de ${d.getFullYear()}`
}
