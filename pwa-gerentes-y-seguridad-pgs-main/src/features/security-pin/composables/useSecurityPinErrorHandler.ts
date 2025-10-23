import { useToast } from 'vue-toast-notification'
import { SECURITY_PIN_ERROR_MESSAGES, type SecurityPinErrorType } from '../constants/errorMessages'

export function useSecurityPinErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: SecurityPinErrorType): void {
    console.error(`Security Pin Error [${errorType}]:`, error)

    const message = SECURITY_PIN_ERROR_MESSAGES[errorType]
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
    messages: SECURITY_PIN_ERROR_MESSAGES
  }
}