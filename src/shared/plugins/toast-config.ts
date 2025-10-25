export const DEFAULT_TOAST_CONFIG = {
  position: 'top-right',
  duration: 4000,
  dismissible: true,
  pauseOnHover: true
}

export const ERROR_TOAST_CONFIG = {
  type: 'error',
  position: 'top-right' as const,
  duration: 5000
}

export const SUCCESS_TOAST_CONFIG = {
  type: 'success',
  position: 'top-right' as const,
  duration: 3000
}