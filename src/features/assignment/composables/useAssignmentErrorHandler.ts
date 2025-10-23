import { useToast } from 'vue-toast-notification'
import { ASSIGNMENT_ERROR_MESSAGES, type AssignmentErrorType } from '../constants/errorMessages'

export function useAssignmentErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: AssignmentErrorType): void {
    console.error(`Assignment Error [${errorType}]:`, error)
    
    const message = ASSIGNMENT_ERROR_MESSAGES[errorType]
    $toast.error(message)
  }

  function handleNetworkError(error: unknown): void {
    if (isNetworkError(error)) {
      handleError(error, 'NETWORK_ERROR')
    } else {
      handleError(error, 'UNKNOWN_ERROR')
    }
  }

  function handleValidationError(error: unknown, message?: string): void {
    console.error('Assignment Validation Error:', error)
    
    if (message) {
      $toast.error(message)
    } else {
      handleError(error, 'UNKNOWN_ERROR')
    }
  }

  function handleSuccessMessage(message: string): void {
    $toast.success(message)
  }

  function isNetworkError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: string }).code
      return ['NETWORK_ERROR', 'ECONNABORTED', 'ENOTFOUND'].includes(code)
    }
    return false
  }

  return {
    handleError,
    handleNetworkError,
    handleValidationError,
    handleSuccessMessage,
    messages: ASSIGNMENT_ERROR_MESSAGES
  }
}