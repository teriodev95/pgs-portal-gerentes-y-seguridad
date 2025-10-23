export const NO_PAYMENT_ERROR_MESSAGES = {
  NO_PAYMENTS_LOAD_FAILED: 'Error al traer los no pagos',
  MANAGEMENTS_LOAD_FAILED: 'Error al cargar las gerencias',
  AGENCIES_LOAD_FAILED: 'Error al cargar las agencias',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type NoPaymentErrorType = keyof typeof NO_PAYMENT_ERROR_MESSAGES