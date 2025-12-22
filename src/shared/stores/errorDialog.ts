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

  function showSimpleError(title = 'Error', message: string, details: string) {
    showError({
      details,
      message,
      title,
      type: 'error',
    })
  }

  function showWarning(title = 'Advertencia', message: string) {
    showError({
      title,
      message,
      type: 'warning'
    })
  }

  function showInfo(title = 'Información', message: string) {
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
    closeDialog,
    clearError
  }
})