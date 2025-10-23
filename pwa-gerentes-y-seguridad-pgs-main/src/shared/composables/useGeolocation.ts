import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import { latLng, type LatLng } from 'leaflet'

export default function useGeolocation() {
  const $toast = useToast()
  const userLocation = ref<LatLng>()
  const locationError = ref<string>()
  const isLoading = ref(false)
  const hasPermission = ref(false)

  const geolocation = navigator.geolocation

  const checkGeolocationPermission = (): Promise<PermissionState> => {
    return new Promise((resolve, reject) => {
      if (!('permissions' in navigator)) {
        reject('Permissions API not supported')
        return
      }
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          resolve(result.state)
        })
        .catch(reject)
    })
  }

  const getLocation = () => {
    isLoading.value = true
    locationError.value = undefined // Limpiar errores previos
    
    geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        userLocation.value = latLng({ lat: latitude, lng: longitude })
        console.log(`Precisión de la ubicación: ${accuracy} metros`)
        isLoading.value = false
        hasPermission.value = true
      },
      (error) => {
        if (error.code === 1) { // PERMISSION_DENIED
          // Permisos realmente denegados
          locationError.value = 'Permisos de ubicación denegados'
          hasPermission.value = false
          $toast.error('Permisos de ubicación denegados. No se podrá guardar la ubicación.')
        } else {
          // Otros errores (timeout, servicio no disponible, etc.)
          handleGeolocationError(`Error al obtener la ubicación: ${error.message}`)
        }
        isLoading.value = false
      },
      {
        timeout: 30000,
        maximumAge: 0
      }
    )
  }

  const requestGeolocationPermission = () => {
    isLoading.value = true
    locationError.value = undefined
    
    geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        userLocation.value = latLng({ lat: latitude, lng: longitude })
        console.log(`Precisión de la ubicación: ${accuracy} metros`)
        isLoading.value = false
        hasPermission.value = true
      },
      (error) => {
        handleGeolocationError(`Error al solicitar permisos: ${error.message}`)
        isLoading.value = false
        hasPermission.value = false
      }
    )
  }

  const handleGeolocationError = (message: string) => {
    console.error(message)
    locationError.value = message
    $toast.error(message)
  }

  const getUserLocation = async () => {
    if (!('geolocation' in navigator)) {
      handleGeolocationError('Geolocalización no soportada en este navegador')
      return
    }

    try {
      const permissionStatus = await checkGeolocationPermission()

      console.log(`Estado de permisos de geolocalización: ${permissionStatus}`)

      if (permissionStatus === 'granted') {
        hasPermission.value = true
        getLocation()
      } else if (permissionStatus === 'prompt') {
        requestGeolocationPermission()
      } else {
        // Permisos denegados - mostrar error apropiado
        hasPermission.value = false
        locationError.value = 'Permisos de ubicación denegados'
        $toast.error('Permisos de ubicación denegados. No se podrá guardar la ubicación.')
      }
    } catch (error) {
      // Si no se puede verificar permisos, intentar obtener ubicación directamente
      console.warn('No se pudo verificar permisos, intentando obtener ubicación directamente')
      getLocation()
    }
  }

  // Función para limpiar el estado de geolocalización
  const resetGeolocationState = () => {
    userLocation.value = undefined
    locationError.value = undefined
    isLoading.value = false
    hasPermission.value = false
  }

  onMounted(() => {
    getUserLocation()
  })

  // Limpiar el estado al desmontar la vista
  onUnmounted(() => {
    resetGeolocationState()
  })

  return {
    userLocation,
    locationError,
    isLoading,
    hasPermission,
    getUserLocation,
    resetGeolocationState
  }
}
