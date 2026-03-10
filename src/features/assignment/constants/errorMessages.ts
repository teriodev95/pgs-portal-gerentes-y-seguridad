import { BASE_ERROR_MESSAGES } from '@/shared/constants/base-error-messages'

export const ASSIGNMENT_ERROR_MESSAGES = {
  PIN_REQUIRED: 'PIN requerido',
  PIN_INCORRECT: 'PIN incorrecto',
  AGENT_CANNOT_RECEIVE: 'Un agente no puede recibir asignaciones',
  ...BASE_ERROR_MESSAGES
} as const

export type AssignmentErrorType = keyof typeof ASSIGNMENT_ERROR_MESSAGES