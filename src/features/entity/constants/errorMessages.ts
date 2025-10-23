export const ENTITY_ERROR_MESSAGES = {
  AGENCY_DASHBOARD_LOAD_FAILED: 'No se pudo cargar los datos de la agencia',
  GERENCY_DASHBOARD_LOAD_FAILED: 'No se pudo cargar los datos de la gerencia',
  LOANS_ABOUT_TO_END_LOAD_FAILED: 'No se pudo cargar los préstamos por finalizar',
  DASHBOARD_BY_DATE_LOAD_FAILED: 'No se pudo cargar los datos para la fecha seleccionada',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type EntityErrorType = keyof typeof ENTITY_ERROR_MESSAGES