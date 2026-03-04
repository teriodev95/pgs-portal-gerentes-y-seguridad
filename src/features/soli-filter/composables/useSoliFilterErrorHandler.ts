import { useToast } from 'vue-toast-notification'

const ERROR_MESSAGES = {
  SUBMIT_FAILED: 'Error al enviar la solicitud. Intenta de nuevo.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  PHOTOS_MISSING: 'Debes capturar las 4 fotos antes de enviar.',
  FIELDS_MISSING: 'Completa todos los campos requeridos.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado.',
} as const

type SoliFilterErrorType = keyof typeof ERROR_MESSAGES

export function useSoliFilterErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, errorType: SoliFilterErrorType): void {
    console.error(`SoliFilter Error [${errorType}]:`, error)
    $toast.error(ERROR_MESSAGES[errorType])
  }

  function handleNetworkError(error: unknown): void {
    if (isNetworkError(error)) {
      handleError(error, 'NETWORK_ERROR')
    } else {
      handleError(error, 'SUBMIT_FAILED')
    }
  }

  function isNetworkError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: string }).code
      return ['NETWORK_ERROR', 'ECONNABORTED', 'ENOTFOUND'].includes(code)
    }
    return false
  }

  return { handleError, handleNetworkError }
}
