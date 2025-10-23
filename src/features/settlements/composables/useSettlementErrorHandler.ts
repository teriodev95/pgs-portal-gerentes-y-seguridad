import { useToast } from 'vue-toast-notification'
import { SETTLEMENT_ERROR_MESSAGES, type SettlementErrorType } from '../constants/errorMessages'

export function useSettlementErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: SettlementErrorType): void {
    console.error(`Settlement Error [${errorType}]:`, error)
    
    const message = SETTLEMENT_ERROR_MESSAGES[errorType]
    $toast.error(message)
  }

  function handleSuccess(message: string): void {
    $toast.success(message)
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
    handleSuccess,
    handleNetworkError,
    messages: SETTLEMENT_ERROR_MESSAGES
  }
}