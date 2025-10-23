import { useToast } from 'vue-toast-notification'

type ErrorType = 
  | 'SALES_LOAD_FAILED'
  | 'SALE_SAVE_FAILED'
  | 'SALE_INIT_FAILED'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR'

const errorMessages: Record<ErrorType, string> = {
  SALES_LOAD_FAILED: 'Error al cargar las ventas',
  SALE_SAVE_FAILED: 'Error al guardar la venta',
  SALE_INIT_FAILED: 'Error al inicializar el módulo de ventas',
  VALIDATION_ERROR: 'Datos de venta no válidos',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
}

export function useSaleErrorHandler() {
  const $toast = useToast()

  function handleError(error: unknown, type: ErrorType = 'UNKNOWN_ERROR'): void {
    console.error(`[Sale Error - ${type}]:`, error)
    
    const message = errorMessages[type]
    
    $toast.open({
      message,
      type: 'error',
      position: 'top-right',
    })
  }

  function handleSuccess(message: string): void {
    $toast.open({
      message,
      type: 'success',
      position: 'top-right',
    })
  }

  return {
    handleError,
    handleSuccess
  }
}