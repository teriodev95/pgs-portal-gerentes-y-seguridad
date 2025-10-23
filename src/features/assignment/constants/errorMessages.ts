export const ASSIGNMENT_ERROR_MESSAGES = {
  ASSIGNMENT_CREATE_FAILED: 'Error al crear la asignación',
  ASSIGNMENT_LOAD_FAILED: 'Error al cargar las asignaciones',
  PIN_VALIDATION_FAILED: 'Error al validar el PIN',
  PIN_REQUIRED: 'PIN requerido',
  PIN_INCORRECT: 'PIN incorrecto',
  AGENT_CANNOT_RECEIVE: 'Un agente no puede recibir asignaciones',
  USER_NOT_AUTHENTICATED: 'Usuario no autenticado',
  INVALID_AMOUNT: 'El monto debe ser mayor a 0',
  MANAGEMENT_SELECTION_REQUIRED: 'Selección de gerencia requerida',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type AssignmentErrorType = keyof typeof ASSIGNMENT_ERROR_MESSAGES