import { ref } from 'vue'

export const usePwaUpdate = () => {
  const isUpdating = ref(false)
  const updateAvailable = ref(false)

  const clearCacheAndReload = async () => {
    try {
      isUpdating.value = true

      // 1. Desregistrar todos los service workers
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(registrations.map(registration => registration.unregister()))
          console.log('Service Workers desregistrados exitosamente')
        } catch (swError) {
          console.warn('Error al desregistrar Service Workers:', swError)
        }
      }

      // 2. Limpiar todas las cachés de la aplicación
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
          console.log('Cachés limpiadas exitosamente')
        } catch (cacheError) {
          console.warn('Error al limpiar cachés:', cacheError)
        }
      }

      // 3. Recargar la página con bypass de caché
      window.location.reload()
    } catch (error) {
      console.error('Error al limpiar cachés:', error)
      // Fallback: forzar reload
      window.location.reload()
    } finally {
      isUpdating.value = false
    }
  }

  const applyUpdate = async () => {
    try {
      isUpdating.value = true

      // Importar dinámicamente updateSW para evitar dependencias circulares
      const { updateSW } = await import('@/main')

      // Usar la función de actualización del SW
      if (updateSW) {
        await updateSW(true)
      } else {
        // Fallback: limpiar cachés y recargar
        await clearCacheAndReload()
      }
    } catch (error) {
      console.error('Error en actualización:', error)
      // Fallback en caso de error
      await clearCacheAndReload()
    }
  }

  return {
    isUpdating,
    updateAvailable,
    clearCacheAndReload,
    applyUpdate
  }
}