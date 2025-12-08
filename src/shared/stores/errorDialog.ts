import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface ErrorInfo {
  title: string
  message: string
  type?: 'error' | 'warning' | 'info'
  details?: string
}

export const useErrorDialogStore = defineStore('errorDialog', () => {
  // State
  const _isOpen = ref(false)
  const _errorInfo = ref<ErrorInfo | null>(null)

  // Getters (computed)
  const isOpen = computed(() => _isOpen.value)
  const errorInfo = computed(() => _errorInfo.value)
  const hasError = computed(() => _errorInfo.value !== null)

  // Setters/Actions
  function showError(error: ErrorInfo) {
    _errorInfo.value = error
    _isOpen.value = true
  }

  function showSimpleError(message: string, title = 'Error') {
    showError({
      title,
      message,
      type: 'error'
    })
  }

  function showWarning(message: string, title = 'Advertencia') {
    showError({
      title,
      message,
      type: 'warning'
    })
  }

  function showInfo(message: string, title = 'Información') {
    showError({
      title,
      message,
      type: 'info'
    })
  }

  function closeDialog() {
    _isOpen.value = false
  }

  function clearError() {
    _errorInfo.value = null
    _isOpen.value = false
  }

  // Helper para errores de API
  function showApiError(error: any, defaultMessage = 'Ha ocurrido un error inesperado') {
    let title = 'Error de Conexión'
    let message = defaultMessage
    let details = ''

    if (error?.response) {
      // Error de respuesta del servidor
      title = `Error ${error.response.status}`
      message = error.response.data?.message || error.response.statusText || defaultMessage
      details = JSON.stringify(error.response.data, null, 2)
    } else if (error?.request) {
      // Error de red
      title = 'Error de Conexión'
      message = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    } else if (error?.message) {
      // Error genérico
      message = error.message
      details = error.stack
    }

    showError({
      title,
      message,
      type: 'error',
      details
    })
  }

  return {
    // Getters
    isOpen,
    errorInfo,
    hasError,

    // Actions
    showError,
    showSimpleError,
    showWarning,
    showInfo,
    showApiError,
    closeDialog,
    clearError
  }
})