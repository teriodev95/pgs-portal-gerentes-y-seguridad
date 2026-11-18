import type { IUser } from '@/features/auth/types'

/** Módulo de la plataforma `pgs` que asigna RH, igual que `agenda-equipo`. FAX exige el mismo. */
export const EQUIPO_GPS_MODULE = 'rastreo-equipo'

/** Con más de 5 personas, los grupos de la lista se despliegan; con 5 o menos se ven abiertos como siempre. */
export const EQUIPO_GPS_DESPLEGABLE_DESDE = 6

/** Con más de 3 sucursales, los chips de sucursal se vuelven un solo selector. */
export const EQUIPO_GPS_SELECTOR_SUCURSAL_DESDE = 4

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

/** Seguridad y Regional entran por su tipo, como a la pantalla principal; cualquier otro, con el módulo. */
const TIPOS_CON_ACCESO = ['Seguridad', 'Regional']

export function hasEquipoGpsPermission(user: IUser | undefined): boolean {
  if (user && TIPOS_CON_ACCESO.includes(user.tipo)) return true
  const pgsModules = Object.entries(user?.plataformas ?? {}).find(
    ([platform]) => platform.toLowerCase() === 'pgs'
  )?.[1]
  return pgsModules?.includes(EQUIPO_GPS_MODULE) ?? false
}
