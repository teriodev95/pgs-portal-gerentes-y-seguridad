import { ref } from 'vue'

export const usePwaUpdate = () => {
  const isUpdating = ref(false)
  const updateAvailable = ref(false)

  const clearCacheAndReload = async () => {
    try {
      isUpdating.value = true

      // Limpiar todas las cachés de la aplicación
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
          console.log('Cachés limpiadas exitosamente')
        } catch (cacheError) {
          console.warn('Error al limpiar cachés:', cacheError)
        }
      }

      // Recargar la página
      window.location.reload()

    } catch (error) {
      console.error('Error al limpiar cachés:', error)
      // Fallback: recarga normal
      window.location.reload()
    } finally {
      isUpdating.value = false
    }
  }

  const forceUpdate = async () => {
    try {
      isUpdating.value = true

      // Limpiar localStorage y sessionStorage si es necesario
      // localStorage.clear()
      // sessionStorage.clear()

      await clearCacheAndReload()
    } catch (error) {
      console.error('Error en actualización forzada:', error)
      isUpdating.value = false
    }
  }

  return {
    isUpdating,
    updateAvailable,
    clearCacheAndReload,
    forceUpdate
  }
}