// composables/useUIState.ts
import { ref, watch } from 'vue'
import { useSignStore } from '@/features/weekly-close/stores'

export function useUIState() {
  const $sign = useSignStore()
  
  const isMenuVisible = ref(true)
  
  // Constants
  const INIT_DRAWER_DELAY = 1000

  /**
   * Initializes the drawer menu visibility
   */
  function initializeMenuVisibility() {
    setTimeout(() => {
      isMenuVisible.value = true
    }, INIT_DRAWER_DELAY)
  }

  /**
   * Sets up watcher for sucursales changes
   */
  function setupSucursalesWatcher(sucursales: any) {
    watch(sucursales, (newValue) => {
      if (newValue.length) {
        initializeMenuVisibility()
      }
    })
  }

  /**
   * Handles component mount logic
   */
  function handleMount(sucursales: string[]) {
    if (sucursales.length) {
      initializeMenuVisibility()
    }

    // Reset sign store values
    $sign.reset()
  }

  return {
    // State
    isMenuVisible,
    
    // Methods
    initializeMenuVisibility,
    setupSucursalesWatcher,
    handleMount
  }
}