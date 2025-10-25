export const VALIDATION_MESSAGES = {
  SUCCESS: {
    ASSIGNMENT_CREATED: 'Asignación creada con éxito'
  }
} as const

export type ValidationMessageType = keyof typeof VALIDATION_MESSAGES