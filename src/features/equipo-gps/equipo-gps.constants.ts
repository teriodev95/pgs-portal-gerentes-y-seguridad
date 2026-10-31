import type { IUser } from '@/features/auth/types'

/** Módulo de la plataforma `pgs` que asigna RH, igual que `agenda-equipo`. FAX exige el mismo. */
export const EQUIPO_GPS_MODULE = 'rastreo-equipo'

/** Cada cuánto se vuelve a pedir la lista con la pantalla visible (presupuesto: ~2 KB/min). */
export const EQUIPO_GPS_POLL_MS = 60_000

/** Color del recorrido: el azul de acción de Xpress, como el marcador por defecto de MOX. */
export const EQUIPO_GPS_COLOR = '#2563eb'

export function hasEquipoGpsPermission(user: IUser | undefined): boolean {
  const pgsModules = Object.entries(user?.plataformas ?? {}).find(
    ([platform]) => platform.toLowerCase() === 'pgs'
  )?.[1]
  return pgsModules?.includes(EQUIPO_GPS_MODULE) ?? false
}
