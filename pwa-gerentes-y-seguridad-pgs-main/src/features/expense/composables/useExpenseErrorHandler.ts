import { useToast } from 'vue-toast-notification'
import { EXPENSE_ERROR_MESSAGES, type ExpenseErrorType } from '../constants/errorMessages'

export function useExpenseErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: ExpenseErrorType): void {
    console.error(`Expense Error [${errorType}]:`, error)
    
    const message = EXPENSE_ERROR_MESSAGES[errorType]
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
    messages: EXPENSE_ERROR_MESSAGES
  }
}