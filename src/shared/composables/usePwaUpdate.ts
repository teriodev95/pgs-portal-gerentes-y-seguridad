import { ref } from 'vue'

export const usePwaUpdate = () => {
  const isUpdating = ref(false)
  const updateAvailable = ref(false)

  const clearCacheAndReload = async () => {
    try {
      isUpdating.value = true

      // Limpiar todas las cachés de la aplicación
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName))
        await Promise.all(deletePromises)
      }

      // Si hay un service worker registrado, intentar actualizarlo
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          // Forzar actualización del service worker
          await registration.update()

          // Si hay un service worker en espera, activarlo
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
        }
      }

      // Recargar la página para aplicar los cambios
      window.location.reload()
    } catch (error) {
      console.error('Error al actualizar la aplicación:', error)
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