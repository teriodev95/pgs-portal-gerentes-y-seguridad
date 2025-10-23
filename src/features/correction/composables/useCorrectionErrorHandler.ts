import { useToast } from 'vue-toast-notification'
import { CORRECTION_ERROR_MESSAGES, type CorrectionErrorType } from '../constants/errorMessages'

export function useCorrectionErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: CorrectionErrorType): void {
    console.error(`Correction Error [${errorType}]:`, error)
    
    const message = CORRECTION_ERROR_MESSAGES[errorType]
    $toast.error(message)
  }

  function handleNetworkError(error: unknown): void {
    if (isNetworkError(error)) {
      handleError(error, 'NETWORK_ERROR')
    } else {
      handleError(error, 'UNKNOWN_ERROR')
    }
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
    messages: CORRECTION_ERROR_MESSAGES
  }
}