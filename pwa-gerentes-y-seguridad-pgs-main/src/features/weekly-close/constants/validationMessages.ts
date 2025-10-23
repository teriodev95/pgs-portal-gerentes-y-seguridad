export const WEEKLY_CLOSE_VALIDATION_MESSAGES = {
  // Field validation messages
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_AMOUNT: 'El monto debe ser mayor a 0',
  INVALID_NUMBER: 'Debe ingresar un número válido',
  INVALID_PIN: 'PIN incorrecto',

  // Modal validation messages
  MOTIVATION_REQUIRED: 'El motivo es requerido para este campo',
  MINIMUM_LENGTH: 'Debe tener al menos 3 caracteres',
  MAXIMUM_LENGTH: 'No puede exceder 100 caracteres',

  // Form validation messages
  SIGNATURE_REQUIRED: 'La firma es requerida',
  PIN_REQUIRED: 'El PIN es requerido',
  VIDEO_VERIFICATION_REQUIRED: 'La verificación en video es requerida',

  // Security validation messages
  PIN_VALIDATION_FAILED: 'El PIN ingresado no es válido',
  SECURITY_PIN_INACTIVE: 'No hay un PIN de seguridad activo',

  // Step validation messages
  STEP_VALIDATION_FAILED: 'No se puede continuar sin completar este paso',
  PREVIOUS_STEP_REQUIRED: 'Debe completar el paso anterior'
} as const

export type WeeklyCloseValidationType = keyof typeof WEEKLY_CLOSE_VALIDATION_MESSAGES

// Validation rules for different input types
export const VALIDATION_RULES = {
  PIN_LENGTH: { min: 4, max: 6 },
  MOTIVATION_LENGTH: { min: 3, max: 100 },
  AMOUNT_RANGE: { min: 0, max: 999999.99 },
  REQUIRED_FIELDS: ['agente', 'gerente', 'seguridad'] as const
} as const