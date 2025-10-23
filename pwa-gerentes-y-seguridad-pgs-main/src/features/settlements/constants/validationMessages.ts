export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_AMOUNT: 'El monto debe ser mayor a 0',
  INVALID_CLIENT_NAME: 'El nombre del cliente es requerido',
  INVALID_PAYMENT_SOURCE: 'Debe seleccionar una fuente de pago',
  INVALID_RECOVERY_SOURCE: 'Debe seleccionar quién recuperó el pago',
  SETTLEMENT_ALREADY_PROCESSED: 'Esta liquidación ya ha sido procesada',
  INSUFFICIENT_DATA: 'Datos insuficientes para procesar la liquidación'
} as const

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES