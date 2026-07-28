import { VISIT_DETAIL_SEPARATOR } from '../constants'

/** Cliente y préstamo de una visita, tal como viajan en `detalle`. */
export interface VisitTarget {
  cliente: string
  prestamoId: string
}

export function buildVisitDetail(cliente: string, prestamoId: string): string {
  return `${cliente.trim()}${VISIT_DETAIL_SEPARATOR}${prestamoId.trim()}`
}

/**
 * Lee el préstamo del `detalle`. Devuelve `null` cuando la actividad se capturó
 * a mano y no trae préstamo: ahí no hay nada que mandar a FAX.
 */
export function parseVisitDetail(detalle: string | null | undefined): VisitTarget | null {
  if (!detalle) return null

  // Por la derecha: el nombre del cliente puede traer guiones.
  const index = detalle.lastIndexOf(VISIT_DETAIL_SEPARATOR)
  if (index < 0) return null

  const cliente = detalle.slice(0, index).trim()
  const prestamoId = detalle.slice(index + VISIT_DETAIL_SEPARATOR.length).trim()
  return cliente && prestamoId ? { cliente, prestamoId } : null
}
