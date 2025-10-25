import { useErrorHandler } from '@/shared/composables/useErrorHandler'
import { useToast } from 'vue-toast-notification'
import { AUTH_ERROR_MESSAGES, type AuthErrorType } from '../constants/errorMessages'

export function useAuthErrorHandler() {
  const base = useErrorHandler<AuthErrorType>(
    AUTH_ERROR_MESSAGES,
    'Auth'
  )
  const $toast = useToast()

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
        base.handleError(error, 'LOGIN_FAILED')
        return
      }
    }

    base.handleNetworkError(error)
  }

  return {
    ...base,
    handleAuthError
  }
}