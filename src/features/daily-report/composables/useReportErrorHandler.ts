import { useToast } from 'vue-toast-notification'
import { REPORT_ERROR_MESSAGES, type ReportErrorType } from '../constants/errorMessages'

export function useReportErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: ReportErrorType): void {
    console.error(`Report Error [${errorType}]:`, error)

    const message = REPORT_ERROR_MESSAGES[errorType]
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

  function handleApiError(error: unknown, endpoint: string): void {
    console.error(`API Error at ${endpoint}:`, error)

    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status

      switch (status) {
        case 401:
          handleError(error, 'UNAUTHORIZED_ERROR')
          break
        case 403:
          handleError(error, 'FORBIDDEN_ERROR')
          break
        case 500:
          handleError(error, 'SERVER_ERROR')
          break
        default:
          handleError(error, 'API_ERROR')
      }
    } else {
      handleNetworkError(error)
    }
  }

  return {
    handleError,
    handleNetworkError,
    handleApiError,
    messages: REPORT_ERROR_MESSAGES
  }
}