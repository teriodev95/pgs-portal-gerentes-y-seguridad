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
          const deletePromises = cacheNames.map(cacheName =>
            caches.delete(cacheName).catch(err => {
              console.warn(`No se pudo eliminar cache ${cacheName}:`, err)
              return false
            })
          )
          await Promise.all(deletePromises)
          console.log('Cachés limpiadas exitosamente')
        } catch (cacheError) {
          console.warn('Error al limpiar cachés:', cacheError)
        }
      }

      // Si hay un service worker registrado, intentar actualizarlo
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            // Forzar actualización del service worker
            await registration.update()
            console.log('Service worker actualizado')

            // Si hay un service worker en espera, activarlo
            if (registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' })
              console.log('Service worker en espera activado')
            }
          }
        } catch (swError) {
          console.warn('Error al actualizar service worker:', swError)
        }
      }

      // Agregar un pequeño delay antes de recargar
      setTimeout(() => {
        window.location.reload()
      }, 500)

    } catch (error) {
      console.error('Error al actualizar la aplicación:', error)
      // Intentar recarga simple si todo falla
      setTimeout(() => {
        window.location.reload()
      }, 1000)
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