import { useToast } from 'vue-toast-notification'

export const LOAN_ERROR_MESSAGES = {
  LOAN_DATA_LOAD_FAILED: 'Error al cargar los datos del préstamo',
  SETTLEMENT_DATA_LOAD_FAILED: 'Error al cargar los datos de liquidación',
  LOAN_UPDATE_FAILED: 'Error al actualizar el préstamo',
  SETTLEMENT_REQUEST_FAILED: 'Error al procesar la solicitud de liquidación',
  NAVIGATION_ERROR: 'Error de navegación',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado',
  USER_NOT_AUTHENTICATED: 'Usuario no autenticado',
  INVALID_LOAN_DATA: 'Datos del préstamo inválidos',
  WEEKLY_FEE_VALIDATION_ERROR: 'Error de validación de tarifa semanal'
} as const

export type LoanErrorType = keyof typeof LOAN_ERROR_MESSAGES

interface ErrorContext {
  loanId?: string
  userId?: string
  action?: string
  additionalInfo?: Record<string, any>
}

export function useLoanErrorHandler() {
  const $toast = useToast()

  function getErrorMessage(error: unknown, errorType: LoanErrorType): string {
    if (error instanceof Error) {
      // If it's a network error
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return LOAN_ERROR_MESSAGES.NETWORK_ERROR
      }
      
      // If it's an authentication error
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return LOAN_ERROR_MESSAGES.USER_NOT_AUTHENTICATED
      }
    }
    
    return LOAN_ERROR_MESSAGES[errorType]
  }

  function logError(error: unknown, errorType: LoanErrorType, context?: ErrorContext) {
    const errorMessage = getErrorMessage(error, errorType)
    
    console.error(`[Loan Error] ${errorType}:`, {
      message: errorMessage,
      originalError: error,
      context,
      timestamp: new Date().toISOString()
    })
  }

  function handleError(
    error: unknown, 
    errorType: LoanErrorType,
    context?: ErrorContext,
    showToast = true
  ): void {
    const errorMessage = getErrorMessage(error, errorType)
    
    // Log the error for debugging
    logError(error, errorType, context)
    
    // Show toast notification if requested
    if (showToast) {
      $toast.error(errorMessage)
    }
  }

  function handleAsyncError(
    error: unknown,
    errorType: LoanErrorType,
    context?: ErrorContext
  ): Promise<never> {
    handleError(error, errorType, context, true)
    return Promise.reject(error)
  }

  function createErrorHandler(errorType: LoanErrorType, context?: ErrorContext) {
    return (error: unknown) => handleError(error, errorType, context)
  }

  return {
    // Main error handling functions
    handleError,
    handleAsyncError,
    createErrorHandler,
    
    // Utility functions
    getErrorMessage,
    logError,
    
    // Constants
    LOAN_ERROR_MESSAGES
  }
}