export const CASH_FLOW_ERROR_MESSAGES = {
  LOAD_FAILED: 'Error al cargar el flujo de efectivo',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado',
} as const

export type CashFlowErrorType = keyof typeof CASH_FLOW_ERROR_MESSAGES
