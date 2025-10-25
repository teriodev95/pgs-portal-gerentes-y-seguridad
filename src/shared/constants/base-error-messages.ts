export const BASE_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type BaseErrorType = keyof typeof BASE_ERROR_MESSAGES