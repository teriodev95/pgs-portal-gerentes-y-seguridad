/**
 * El sello de "cuando se entrego", en UTC y en formato de MySQL.
 *
 * Va en UTC a proposito: es el mismo reloj con el que el servidor sella la
 * entrega al gerente y con el que oficina sella el retorno. Dos relojes en la
 * misma tabla obligarian a los reportes a convertir una fecha si y otra no.
 */
export function formatDateTimeToSql(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * Hoy como `YYYY-MM-DD` para el campo de fecha, en hora local.
 *
 * Aqui si va el calendario de quien lo ve: es el dia en que el gerente entrego el
 * papel, no un instante. Con UTC, una entrega del martes por la noche saldria
 * fechada el miercoles.
 */
export function fechaDeHoy(date: Date = new Date()): string {
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mes}-${dia}`
}
