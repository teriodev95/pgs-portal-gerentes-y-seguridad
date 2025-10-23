export const CORRECTION_ERROR_MESSAGES = {
  CORRECTION_SUBMIT_FAILED: 'Error al enviar la solicitud de corrección',
  VALIDATION_FAILED: 'Error en la validación de datos',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado',
  INVALID_DATA: 'Los datos ingresados no son válidos',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  SERVER_ERROR: 'Error interno del servidor'
} as const

export type CorrectionErrorType = keyof typeof CORRECTION_ERROR_MESSAGES