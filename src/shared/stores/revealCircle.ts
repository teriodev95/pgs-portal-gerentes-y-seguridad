import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface RevealCircleConfig {
  type: 'success' | 'error'
  mainText: string
  secondaryText: string
  list?: string[]
  subText?: string
  ctaText?: string
}

export const useRevealCircleStore = defineStore('revealCircle', () => {
  // State
  const _isVisible = ref(false)
  const _config = ref<RevealCircleConfig>({
    type: 'success',
    mainText: '',
    secondaryText: '',
    list: undefined,
    subText: undefined,
    ctaText: undefined
  })
  const _onCloseCallback = ref<(() => void) | null>(null)

  // Getters (computed)
  const isVisible = computed(() => _isVisible.value)
  const config = computed(() => _config.value)
  const type = computed(() => _config.value.type)
  const mainText = computed(() => _config.value.mainText)
  const secondaryText = computed(() => _config.value.secondaryText)
  const list = computed(() => _config.value.list)
  const subText = computed(() => _config.value.subText)
  const ctaText = computed(() => _config.value.ctaText)
  const onCloseCallback = computed(() => _onCloseCallback.value)

  // Setters/Actions
  function showRevealCircle(configuration: RevealCircleConfig, onClose?: () => void) {
    _config.value = { ...configuration }
    _onCloseCallback.value = onClose || null
    _isVisible.value = true
  }

  function showSuccess(mainText: string, secondaryText: string, options?: Partial<Omit<RevealCircleConfig, 'type' | 'mainText' | 'secondaryText'>>) {
    showRevealCircle({
      type: 'success',
      mainText,
      secondaryText,
      ...options
    })
  }

  function showError(mainText: string, secondaryText: string, options?: Partial<Omit<RevealCircleConfig, 'type' | 'mainText' | 'secondaryText'>>) {
    showRevealCircle({
      type: 'error',
      mainText,
      secondaryText,
      ...options
    })
  }

  function hideRevealCircle() {
    _isVisible.value = false
    // Execute callback if exists
    if (_onCloseCallback.value) {
      _onCloseCallback.value()
      _onCloseCallback.value = null
    }
  }

  function updateConfig(newConfig: Partial<RevealCircleConfig>) {
    _config.value = { ..._config.value, ...newConfig }
  }

  function clearConfig() {
    _config.value = {
      type: 'success',
      mainText: '',
      secondaryText: '',
      list: undefined,
      subText: undefined,
      ctaText: undefined
    }
    _onCloseCallback.value = null
    _isVisible.value = false
  }

  return {
    // Getters
    isVisible,
    config,
    type,
    mainText,
    secondaryText,
    list,
    subText,
    ctaText,
    onCloseCallback,

    // Actions
    showRevealCircle,
    showSuccess,
    showError,
    hideRevealCircle,
    updateConfig,
    clearConfig
  }
})
