export const TABULATION_ERROR_MESSAGES = {
  TABULATION_LOAD_FAILED: 'Error al cargar la tabulación',
  TABULATION_SAVE_FAILED: 'Error al guardar la tabulación',
  TABULATION_UPDATE_FAILED: 'Error al actualizar la tabulación',
  INVALID_DENOMINATION_VALUE: 'Valor de denominación inválido',
  VALIDATION_FAILED: 'Error de validación en la tabulación',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type TabulationErrorType = keyof typeof TABULATION_ERROR_MESSAGES