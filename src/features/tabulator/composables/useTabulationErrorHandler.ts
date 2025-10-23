import { useToast } from 'vue-toast-notification'
import { TABULATION_ERROR_MESSAGES, type TabulationErrorType } from '../constants/errorMessages'

export function useTabulationErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: TabulationErrorType): void {
    console.error(`Tabulation Error [${errorType}]:`, error)
    
    const message = TABULATION_ERROR_MESSAGES[errorType]
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
    messages: TABULATION_ERROR_MESSAGES
  }
}