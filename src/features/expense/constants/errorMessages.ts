export const EXPENSE_ERROR_MESSAGES = {
  WEEKLY_EXPENSES_LOAD_FAILED: 'Error al cargar los gastos semanales',
  EXPENSE_SAVE_FAILED: 'Error al guardar el gasto',
  EXPENSE_UPDATE_FAILED: 'Error al actualizar el gasto',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type ExpenseErrorType = keyof typeof EXPENSE_ERROR_MESSAGES