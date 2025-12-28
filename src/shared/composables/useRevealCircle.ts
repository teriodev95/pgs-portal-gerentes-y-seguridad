import { ref, type Ref } from 'vue'

export interface RevealCircleConfig {
  type: 'success' | 'error'
  mainText: string
  secondaryText: string
  list?: string[]
  subText?: string
  ctaText?: string
}

export interface UseRevealCircleReturn {
  isVisible: Ref<boolean>
  config: Ref<RevealCircleConfig>
  showRevealCircle: (configuration: RevealCircleConfig) => void
  hideRevealCircle: () => void
  updateConfig: (newConfig: Partial<RevealCircleConfig>) => void
}

export function useRevealCircle(initialConfig?: Partial<RevealCircleConfig>): UseRevealCircleReturn {
  const isVisible = ref<boolean>(false)

  const defaultConfig: RevealCircleConfig = {
    type: 'success',
    mainText: '',
    secondaryText: '',
    list: undefined,
    subText: undefined,
    ctaText: undefined
  }

  const config = ref<RevealCircleConfig>({
    ...defaultConfig,
    ...initialConfig
  })

  const showRevealCircle = (configuration: RevealCircleConfig) => {
    config.value = { ...configuration }
    isVisible.value = true
  }

  const hideRevealCircle = () => {
    isVisible.value = false
  }

  const updateConfig = (newConfig: Partial<RevealCircleConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  return {
    isVisible,
    config,
    showRevealCircle,
    hideRevealCircle,
    updateConfig
  }
}