import { ref } from 'vue'

export interface ShareDataOptions {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

export interface ShareResult {
  success: boolean
  method?: 'native' | 'fallback'
  error?: string
}

export function useShareData() {
  const isSharing = ref(false)

  function canShareNatively(options: ShareDataOptions): boolean {
    return (
      'share' in navigator &&
      'canShare' in navigator &&
      navigator.canShare(options)
    )
  }

  async function shareNatively(options: ShareDataOptions): Promise<ShareResult> {
    try {
      await navigator.share(options)
      return { success: true, method: 'native' }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Native sharing failed')
    }
  }

  async function shareData(options: ShareDataOptions): Promise<ShareResult> {
    isSharing.value = true

    try {
      if (canShareNatively(options)) {
        return await shareNatively(options)
      } else {
        return { success: false, error: 'Native sharing not supported' }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share data'
      return { success: false, error: errorMessage }
    } finally {
      isSharing.value = false
    }
  }

  return {
    // State
    isSharing,

    // Methods
    shareData,
    canShareNatively,
    shareNatively,
  }
}