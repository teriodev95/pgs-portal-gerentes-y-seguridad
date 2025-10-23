export const INCIDENT_ERROR_MESSAGES = {
  INCIDENTS_LOAD_FAILED: 'Error al cargar los incidentes',
  INCIDENT_SAVE_FAILED: 'Error al guardar el incidente',
  INCIDENT_UPDATE_FAILED: 'Error al actualizar el incidente',
  INCIDENT_INIT_FAILED: 'Error al inicializar la vista de incidentes',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type IncidentErrorType = keyof typeof INCIDENT_ERROR_MESSAGES