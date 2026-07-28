import { VISIT_DETAIL_SEPARATOR } from '../constants'

/** Cliente y préstamo de una visita, tal como viajan en `detalle`. */
export interface VisitTarget {
  cliente: string
  prestamoId: string
}

/**
 * `cliente` y `prestamoId` son columnas nullable de `visitas`: con una de las dos
 * vacía se arma el detalle con la otra, en vez de dejar el separador suelto o
 * romper al agregar la visita a la agenda.
 */
export function buildVisitDetail(cliente: string | null, prestamoId: string | null): string {
  return [cliente?.trim(), prestamoId?.trim()].filter(Boolean).join(VISIT_DETAIL_SEPARATOR)
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
