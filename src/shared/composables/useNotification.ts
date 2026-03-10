import { useToast } from 'vue-toast-notification'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type NotificationPosition = 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left'

export interface NotificationOptions {
  message: string
  type?: NotificationType
  duration?: number
  position?: NotificationPosition
  dismissible?: boolean
  pauseOnHover?: boolean
  queue?: boolean
}

/**
 * Configuración por defecto para las notificaciones
 */
const DEFAULT_CONFIG = {
  duration: 4000,
  position: 'top-right' as NotificationPosition,
  dismissible: true,
  pauseOnHover: true,
  queue: false
}

/**
 * Configuración específica por tipo de notificación
 */
const TYPE_CONFIG: Record<NotificationType, Partial<NotificationOptions>> = {
  success: {
    duration: 3000
  },
  error: {
    duration: 5000
  },
  warning: {
    duration: 4500
  },
  info: {
    duration: 4000
  }
}

/**
 * Composable para manejo centralizado de notificaciones toast
 *
 * @example
 * ```ts
 * const { showSuccess, showError, showWarning, showInfo } = useNotification()
 *
 * // Uso simple
 * showSuccess('Operación exitosa')
 * showError('Error al procesar')
 *
 * // Uso con opciones personalizadas
 * showWarning('Advertencia importante', { duration: 6000, position: 'top' })
 *
 * // Uso con el método genérico
 * show({ message: 'Notificación', type: 'info', duration: 3000 })
 * ```
 */
export function useNotification() {
  const $toast = useToast()

  /**
   * Muestra una notificación con configuración personalizable
   */
  function show(options: NotificationOptions): void {
    const type = options.type || 'info'
    const config = {
      ...DEFAULT_CONFIG,
      ...TYPE_CONFIG[type],
      ...options
    }

    const toastOptions = {
      position: config.position,
      duration: config.duration,
      dismissible: config.dismissible,
      pauseOnHover: config.pauseOnHover,
      queue: config.queue
    }

    switch (type) {
      case 'success':
        $toast.success(config.message, toastOptions)
        break
      case 'error':
        $toast.error(config.message, toastOptions)
        break
      case 'warning':
        $toast.warning(config.message, toastOptions)
        break
      case 'info':
        $toast.info(config.message, toastOptions)
        break
    }
  }

  /**
   * Muestra una notificación de éxito
   */
  function showSuccess(message: string, options?: Omit<NotificationOptions, 'message' | 'type'>): void {
    show({ message, type: 'success', ...options })
  }

  /**
   * Muestra una notificación de error
   */
  function showError(message: string, options?: Omit<NotificationOptions, 'message' | 'type'>): void {
    show({ message, type: 'error', ...options })
  }

  /**
   * Muestra una notificación de advertencia
   */
  function showWarning(message: string, options?: Omit<NotificationOptions, 'message' | 'type'>): void {
    show({ message, type: 'warning', ...options })
  }

  /**
   * Muestra una notificación informativa
   */
  function showInfo(message: string, options?: Omit<NotificationOptions, 'message' | 'type'>): void {
    show({ message, type: 'info', ...options })
  }

  /**
   * Cierra todas las notificaciones activas
   */
  function clear(): void {
    $toast.clear()
  }

  return {
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clear
  }
}
