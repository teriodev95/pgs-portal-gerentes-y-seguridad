import { useToast } from 'vue-toast-notification'
import { WEEKLY_CLOSE_ERROR_MESSAGES, type WeeklyCloseErrorType } from '../constants/errorMessages'

export function useWeeklyCloseErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: WeeklyCloseErrorType): void {
    console.error(`Weekly Close Error [${errorType}]:`, error)

    const message = WEEKLY_CLOSE_ERROR_MESSAGES[errorType]
    $toast.error(message, {
      position: 'top-right',
    })
  }

  function handleNetworkError(error: unknown): void {
    if (isNetworkError(error)) {
      handleError(error, 'NETWORK_ERROR')
    } else {
      handleError(error, 'UNKNOWN_ERROR')
    }
  }

  function handleAPIError(error: unknown, operation: 'GET' | 'CREATE' | 'UPDATE' = 'GET'): void {
    console.error(`API Error during ${operation}:`, error)

    const errorMap: Record<string, WeeklyCloseErrorType> = {
      'GET': 'WEEKLY_CLOSE_GET_FAILED',
      'CREATE': 'WEEKLY_CLOSE_CREATE_FAILED',
      'UPDATE': 'WEEKLY_CLOSE_SAVE_FAILED'
    }

    handleError(error, errorMap[operation])
  }

  function handleValidationError(error: unknown, context?: string): void {
    console.error(`Validation Error${context ? ` in ${context}` : ''}:`, error)
    handleError(error, 'VALIDATION_ERROR')
  }

  function handleModalError(error: unknown, modalContext?: string): void {
    console.error(`Modal Error${modalContext ? ` for ${modalContext}` : ''}:`, error)
    handleError(error, 'MODAL_SAVE_ERROR')
  }

  function handleSecurityError(error: unknown): void {
    console.error('Security Error:', error)

    // Check if it's a known security error by message
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message: string }).message

      if (message.includes('PIN incorrecto o caducado')) {
        handleError(error, 'INVALID_OR_EXPIRED_PIN')
        return
      }

      if (message.includes('PIN de seguridad incorrecto')) {
        handleError(error, 'INCORRECT_SECURITY_PIN')
        return
      }
    }

    // Default to NO_SECURITY_PIN for other security errors
    handleError(error, 'NO_SECURITY_PIN')
  }

  function handleSubmissionError(error: unknown): void {
    console.error('Submission Error:', error)
    handleError(error, 'SUBMISSION_FAILED')
  }

  function isNetworkError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: string }).code
      return ['NETWORK_ERROR', 'ECONNABORTED', 'ENOTFOUND', 'ERR_NETWORK'].includes(code)
    }

    // Check for common axios network error patterns
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message: string }).message.toLowerCase()
      return message.includes('network') || message.includes('connection') || message.includes('timeout')
    }

    return false
  }

  function isValidationError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message: string }).message.toLowerCase()
      return message.includes('validation') || message.includes('invalid') || message.includes('required')
    }
    return false
  }

  return {
    // Main error handlers
    handleError,
    handleNetworkError,
    handleAPIError,
    handleValidationError,
    handleModalError,
    handleSecurityError,
    handleSubmissionError,

    // Utility functions
    isNetworkError,
    isValidationError,

    // Error messages reference
    messages: WEEKLY_CLOSE_ERROR_MESSAGES
  }
}