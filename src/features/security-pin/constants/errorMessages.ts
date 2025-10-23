export const SECURITY_PIN_ERROR_MESSAGES = {
  PIN_CHECK_FAILED: 'Error al verificar el PIN existente',
  PIN_CREATE_FAILED: 'Error al generar el PIN de seguridad',
  PIN_LOAD_FAILED: 'Error al cargar la información del PIN',
  MANAGEMENT_SELECTION_FAILED: 'Error al seleccionar la gerencia',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type SecurityPinErrorType = keyof typeof SECURITY_PIN_ERROR_MESSAGES