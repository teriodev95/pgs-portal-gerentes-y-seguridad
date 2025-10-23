import { useToast } from 'vue-toast-notification'
import {
  PAYMENT_HISTORY_ERROR_MESSAGES,
  MAP_PAYMENT_ERROR_MESSAGES,
  type PaymentHistoryErrorType,
  type MapPaymentErrorType
} from '../constants/errorMessages'

export function usePaymentDetailsErrorHandler() {
  const $toast = useToast()

  function handlePaymentHistoryError(error: unknown, errorType: PaymentHistoryErrorType): void {
    console.error(`Payment History Error [${errorType}]:`, error)
    const message = PAYMENT_HISTORY_ERROR_MESSAGES[errorType]
    $toast.error(message)
  }

  function handleMapError(error: unknown, errorType: MapPaymentErrorType): void {
    console.error(`Map Payment Error [${errorType}]:`, error)
    const message = MAP_PAYMENT_ERROR_MESSAGES[errorType]
    $toast.error(message)
  }

  function handleNetworkError(error: unknown): void {
    if (isNetworkError(error)) {
      handlePaymentHistoryError(error, 'NETWORK_ERROR')
    } else {
      handlePaymentHistoryError(error, 'UNKNOWN_ERROR')
    }
  }

  function handleApiError(error: any): void {
    if (error?.response?.status === 404) {
      handleMapError(error, 'FETCH_ERROR')
    } else if (error?.response?.status >= 500) {
      handleMapError(error, 'NETWORK_ERROR')
    } else if (error?.code === 'NETWORK_ERROR') {
      handleMapError(error, 'NETWORK_ERROR')
    } else {
      handleMapError(error, 'FETCH_ERROR')
    }
  }

  function handleMapInitError(error: any): void {
    if (error?.message?.includes('token')) {
      handleMapError(error, 'MAPBOX_TOKEN_ERROR')
    } else if (error?.message?.includes('network')) {
      handleMapError(error, 'NETWORK_ERROR')
    } else {
      handleMapError(error, 'MAP_INIT_ERROR')
    }
  }

  function handleGeolocationError(error: any): void {
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        $toast.error('Permisos de ubicación denegados')
        break
      case 2: // POSITION_UNAVAILABLE
        $toast.error('Ubicación no disponible')
        break
      case 3: // TIMEOUT
        $toast.error('Tiempo de espera agotado para obtener ubicación')
        break
      default:
        handleMapError(error, 'GEOLOCATION_ERROR')
    }
  }

  function isNetworkError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: string }).code
      return ['NETWORK_ERROR', 'ECONNABORTED', 'ENOTFOUND'].includes(code)
    }
    return false
  }

  function showSuccess(message: string): void {
    $toast.success(message)
  }

  function showWarning(message: string): void {
    $toast.warning(message)
  }

  return {
    // Payment History methods
    handleError: handlePaymentHistoryError,
    handleNetworkError,

    // Map methods
    handleMapError,
    handleApiError,
    handleMapInitError,
    handleGeolocationError,

    // Utility methods
    showSuccess,
    showWarning,

    // Messages
    paymentHistoryMessages: PAYMENT_HISTORY_ERROR_MESSAGES,
    mapMessages: MAP_PAYMENT_ERROR_MESSAGES
  }
}

// Backward compatibility exports
export const usePaymentHistoryErrorHandler = usePaymentDetailsErrorHandler
export const useMapPaymentErrorHandler = usePaymentDetailsErrorHandler