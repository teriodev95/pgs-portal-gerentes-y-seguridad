import { useToast } from 'vue-toast-notification'
import { NO_PAYMENT_ERROR_MESSAGES, type NoPaymentErrorType } from '../constants'

export function useNoPaymentErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: NoPaymentErrorType): void {
    console.error(`NoPayment Error [${errorType}]:`, error)

    const message = NO_PAYMENT_ERROR_MESSAGES[errorType]
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
    messages: NO_PAYMENT_ERROR_MESSAGES
  }
}