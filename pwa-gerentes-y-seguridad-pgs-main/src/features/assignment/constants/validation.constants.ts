export const VALIDATION_MESSAGES = {
  SUCCESS: {
    ASSIGNMENT_CREATED: 'Asignación creada con éxito',
    PIN_VALIDATED: 'PIN validado correctamente'
  },
  VALIDATION: {
    AMOUNT_REQUIRED: 'El monto es requerido',
    AMOUNT_POSITIVE: 'El monto debe ser mayor a 0',
    PIN_REQUIRED: 'PIN requerido',
    SENDER_REQUIRED: 'Usuario que entrega es requerido',
    RECIPIENT_REQUIRED: 'Usuario que recibe es requerido',
    MANAGEMENT_REQUIRED: 'Selección de gerencia requerida'
  },
  BUSINESS_RULES: {
    AGENT_CANNOT_RECEIVE: 'Un agente no puede recibir asignaciones',
    DIFFERENT_USERS_REQUIRED: 'El usuario que entrega y recibe deben ser diferentes'
  }
} as const

export const MIN_AMOUNT = 1
export const MAX_PIN_LENGTH = 10
export const MIN_PIN_LENGTH = 4

export type ValidationMessageType = keyof typeof VALIDATION_MESSAGES