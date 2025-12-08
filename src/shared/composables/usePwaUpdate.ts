import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const usePwaUpdate = () => {
  const isUpdating = ref(false)
  const updateAvailable = ref(false)
  const router = useRouter()

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

      // Navegar al home y hacer reload con bypass de cache
      await router.push('/')

      // Usar window.location.href con timestamp para bypass total del cache
      window.location.href='/'
    } catch (error) {
      console.error('Error al limpiar cachés:', error)
      // Fallback: navegar al home
      router.push('/')
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