import { useToast } from 'vue-toast-notification'
import { AUTH_ERROR_MESSAGES, type AuthErrorType } from '../constants/errorMessages'

export function useAuthErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: AuthErrorType): void {
    console.error(`Auth Error [${errorType}]:`, error)
    
    const message = AUTH_ERROR_MESSAGES[errorType]
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

  function handleAuthError(error: unknown): void {
    console.error('Auth Error:', error)
    
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as any).response
      
      // Use server message if available, otherwise fallback to constants
      const serverMessage = response?.data
      if (serverMessage && typeof serverMessage === 'string') {
        $toast.error(serverMessage)
        return
      }
      
      // Fallback to status-based error handling
      if (response?.status === 401 || response?.status === 403) {
        handleError(error, 'LOGIN_FAILED')
        return
      }
    }
    
    handleNetworkError(error)
  }

  return {
    handleError,
    handleNetworkError,
    handleAuthError,
    messages: AUTH_ERROR_MESSAGES
  }
}