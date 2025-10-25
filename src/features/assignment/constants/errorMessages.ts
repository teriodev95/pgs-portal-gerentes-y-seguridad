import { BASE_ERROR_MESSAGES } from '@/shared/constants/base-error-messages'

export const ASSIGNMENT_ERROR_MESSAGES = {
  ASSIGNMENT_CREATE_FAILED: 'Error al crear la asignación',
  ASSIGNMENT_LOAD_FAILED: 'Error al cargar las asignaciones',
  PIN_VALIDATION_FAILED: 'Error al validar el PIN',
  PIN_REQUIRED: 'PIN requerido',
  PIN_INCORRECT: 'PIN incorrecto',
  AGENT_CANNOT_RECEIVE: 'Un agente no puede recibir asignaciones',
  ...BASE_ERROR_MESSAGES
} as const

export type AssignmentErrorType = keyof typeof ASSIGNMENT_ERROR_MESSAGES