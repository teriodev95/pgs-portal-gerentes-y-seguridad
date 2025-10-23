export const SETTLEMENT_ERROR_MESSAGES = {
  SETTLEMENT_LOAD_FAILED: 'Error al cargar los datos de liquidación',
  SETTLEMENT_PROCESS_FAILED: 'Error al procesar la liquidación',
  SETTLEMENT_SAVE_FAILED: 'Error al guardar la liquidación',
  VALIDATION_ERROR: 'Datos de liquidación no válidos',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado',
  PAYMENT_DATA_INVALID: 'Los datos de pago no son válidos',
  USER_NOT_AUTHENTICATED: 'Usuario no autenticado'
} as const

export type SettlementErrorType = keyof typeof SETTLEMENT_ERROR_MESSAGES