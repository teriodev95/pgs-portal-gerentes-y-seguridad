import { useToast } from 'vue-toast-notification'

export interface ErrorMessages {
  NETWORK_ERROR: string
  UNKNOWN_ERROR: string
  [key: string]: string
}

export function useErrorHandler<T extends string>(
  messages: Record<T | 'NETWORK_ERROR' | 'UNKNOWN_ERROR', string>,
  context: string = 'App'
) {
  const $toast = useToast()

  function handleError(error: unknown, errorType: T | 'NETWORK_ERROR' | 'UNKNOWN_ERROR'): void {
    console.error(`${context} Error [${errorType}]:`, error)

    const message = messages[errorType]
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
    console.error(`${context} Validation Error:`, error)

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
      return ['NETWORK_ERROR', 'ECONNABORTED', 'ENOTFOUND', 'ERR_NETWORK'].includes(code)
    }

    // Check for common axios network error patterns
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message: string }).message.toLowerCase()
      return message.includes('network') || message.includes('connection') || message.includes('timeout')
    }

    return false
  }

  return {
    handleError,
    handleNetworkError,
    handleValidationError,
    handleSuccessMessage,
    isNetworkError,
    messages
  }
}