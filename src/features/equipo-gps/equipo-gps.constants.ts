import type { IUser } from '@/features/auth/types'

/** Módulo de la plataforma `pgs` que asigna RH, igual que `agenda-equipo`. FAX exige el mismo. */
export const EQUIPO_GPS_MODULE = 'rastreo-equipo'

/** Cada cuánto se vuelve a pedir la lista con la pantalla visible (presupuesto: ~2 KB/min). */
export const EQUIPO_GPS_POLL_MS = 60_000

/** Azul de acción de Xpress (MOX): sólo acciones y lo seleccionado; el recorrido lo usa como color base. */
export const EQUIPO_GPS_COLOR = '#2563eb'

/** Nombre corto de cada sucursal por el código que trae FAX en `gerencia.sucursal`. */
export const SUCURSALES: Record<string, string> = {
  GERC: 'Capital',
  GERD: 'Dinero',
  GERDC: 'DEC',
  GERE: 'Efectivo',
  GERGC: 'GoCash',
  GERM: 'Moneda',
  GERP: 'Plata'
}

export function hasEquipoGpsPermission(user: IUser | undefined): boolean {
  const pgsModules = Object.entries(user?.plataformas ?? {}).find(
    ([platform]) => platform.toLowerCase() === 'pgs'
  )?.[1]
  return pgsModules?.includes(EQUIPO_GPS_MODULE) ?? false
}
