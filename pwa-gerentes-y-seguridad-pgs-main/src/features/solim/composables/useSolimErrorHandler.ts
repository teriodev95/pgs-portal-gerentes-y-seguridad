import { useToast } from 'vue-toast-notification'
import { SOLIM_ERROR_MESSAGES, type SolimErrorType } from '../constants/errorMessages'

export function useSolimErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: SolimErrorType): void {
    console.error(`Solim Error [${errorType}]:`, error)
    
    const message = SOLIM_ERROR_MESSAGES[errorType]
    $toast.error(message)
  }

  function handleNetworkError(error: unknown): void {
    if (isNetworkError(error)) {
      handleError(error, 'NETWORK_ERROR')
    } else {
      handleError(error, 'UNKNOWN_ERROR')
    }
  }

  function handleAuthError(error: unknown): void {
    if (isAuthError(error)) {
      handleError(error, 'UNAUTHORIZED_ACTION')
    } else {
      handleNetworkError(error)
    }
  }

  function isNetworkError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: string }).code
      return ['NETWORK_ERROR', 'ECONNABORTED', 'ENOTFOUND'].includes(code)
    }
    return false
  }

  function isAuthError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status
      return [401, 403].includes(status)
    }
    return false
  }

  return {
    handleError,
    handleNetworkError,
    handleAuthError,
    messages: SOLIM_ERROR_MESSAGES
  }
}