import { ref, computed } from 'vue'
import { useToast } from 'vue-toast-notification'

/**
 * Composable para manejar permisos de cámara y micrófono
 *
 * Proporciona funcionalidad para:
 * - Verificar el estado actual de permisos
 * - Solicitar permisos de cámara/micrófono
 * - Manejar rechazos y reintentos
 * - Proporcionar mensajes claros al usuario
 */
export const useCameraPermissions = () => {
  const toast = useToast()

  // ============================================================================
  // ESTADO
  // ============================================================================
  const cameraPermissionState = ref<PermissionState | 'unknown'>('unknown')
  const microphonePermissionState = ref<PermissionState | 'unknown'>('unknown')
  const checkingPermissions = ref(false)
  const requestingPermissions = ref(false)

  // ============================================================================
  // COMPUTED
  // ============================================================================
  const isCameraGranted = computed(() => cameraPermissionState.value === 'granted')
  const isCameraDenied = computed(() => cameraPermissionState.value === 'denied')
  const isCameraPrompt = computed(() => cameraPermissionState.value === 'prompt' || cameraPermissionState.value === 'unknown')

  const isMicrophoneGranted = computed(() => microphonePermissionState.value === 'granted')
  const isMicrophoneDenied = computed(() => microphonePermissionState.value === 'denied')

  const arePermissionsGranted = computed(() => isCameraGranted.value && isMicrophoneGranted.value)
  const arePermissionsDenied = computed(() => isCameraDenied.value || isMicrophoneDenied.value)

  // ============================================================================
  // MÉTODOS
  // ============================================================================

  /**
   * Verifica el estado actual de los permisos de cámara usando la Permissions API
   */
  const checkCameraPermission = async (): Promise<PermissionState> => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({
          name: 'camera' as PermissionName
        })

        cameraPermissionState.value = permissionStatus.state

        // Escuchar cambios en los permisos
        permissionStatus.onchange = () => {
          cameraPermissionState.value = permissionStatus.state
        }

        return permissionStatus.state
      } else {
        // Si la API no está disponible, asumir que se debe solicitar
        cameraPermissionState.value = 'prompt'
        return 'prompt'
      }
    } catch (error) {
      console.warn('Error checking camera permissions:', error)
      cameraPermissionState.value = 'unknown'
      return 'prompt'
    }
  }

  /**
   * Verifica el estado actual de los permisos de micrófono usando la Permissions API
   */
  const checkMicrophonePermission = async (): Promise<PermissionState> => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({
          name: 'microphone' as PermissionName
        })

        microphonePermissionState.value = permissionStatus.state

        // Escuchar cambios en los permisos
        permissionStatus.onchange = () => {
          microphonePermissionState.value = permissionStatus.state
        }

        return permissionStatus.state
      } else {
        // Si la API no está disponible, asumir que se debe solicitar
        microphonePermissionState.value = 'prompt'
        return 'prompt'
      }
    } catch (error) {
      console.warn('Error checking microphone permissions:', error)
      microphonePermissionState.value = 'unknown'
      return 'prompt'
    }
  }

  /**
   * Verifica todos los permisos necesarios
   */
  const checkAllPermissions = async (): Promise<void> => {
    checkingPermissions.value = true

    try {
      await Promise.all([
        checkCameraPermission(),
        checkMicrophonePermission()
      ])
    } finally {
      checkingPermissions.value = false
    }
  }

  /**
   * Solicita permisos de cámara y micrófono intentando acceder a getUserMedia
   * Siempre intenta solicitar permisos, mostrando el diálogo nativo del navegador/PWA
   *
   * @param silentMode - Si es true, no muestra mensajes toast de éxito/error
   */
  const requestCameraPermissions = async (silentMode = false): Promise<MediaStream | null> => {
    requestingPermissions.value = true

    try {
      console.log('[CameraPermissions] Solicitando permisos de cámara y micrófono...')

      // Siempre intentar solicitar permisos, el navegador/PWA mostrará su diálogo nativo
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user' // Preferir cámara frontal en dispositivos móviles
        },
        audio: true
      })

      console.log('[CameraPermissions] ✓ Permisos concedidos')

      // Si obtuvimos el stream, actualizar los estados
      cameraPermissionState.value = 'granted'
      microphonePermissionState.value = 'granted'

      if (!silentMode) {
        toast.success('Permisos de cámara y micrófono concedidos')
      }

      return stream
    } catch (error) {
      console.error('[CameraPermissions] ✗ Error al solicitar permisos:', error)

      // Manejar diferentes tipos de errores
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            console.warn('[CameraPermissions] Permisos denegados por el usuario')
            cameraPermissionState.value = 'denied'
            microphonePermissionState.value = 'denied'
            if (!silentMode) {
              toast.warning('Debes permitir el acceso a la cámara para grabar la verificación. Por favor, intenta nuevamente.')
            }
            break

          case 'NotFoundError':
          case 'DevicesNotFoundError':
            console.warn('[CameraPermissions] No se encontró cámara o micrófono')
            if (!silentMode) {
              toast.error('No se encontró cámara o micrófono en este dispositivo')
            }
            break

          case 'NotReadableError':
          case 'TrackStartError':
            console.warn('[CameraPermissions] Cámara en uso por otra aplicación')
            if (!silentMode) {
              toast.error('La cámara está siendo usada por otra aplicación')
            }
            break

          case 'OverconstrainedError':
          case 'ConstraintNotSatisfiedError':
            console.warn('[CameraPermissions] Configuración no compatible')
            if (!silentMode) {
              toast.error('Configuración de cámara no compatible')
            }
            break

          case 'TypeError':
            console.warn('[CameraPermissions] Error de tipo en configuración')
            if (!silentMode) {
              toast.error('Error en la configuración de permisos')
            }
            break

          default:
            console.warn('[CameraPermissions] Error desconocido:', error.name)
            if (!silentMode) {
              toast.error('Error al acceder a la cámara')
            }
            console.error('Camera permission error:', error)
        }
      } else {
        console.warn('[CameraPermissions] Error no-DOMException:', error)
        if (!silentMode) {
          toast.error('Error desconocido al acceder a la cámara')
        }
        console.error('Unknown camera error:', error)
      }

      return null
    } finally {
      requestingPermissions.value = false
    }
  }

  /**
   * Reinicia el estado de permisos para permitir nuevos intentos
   */
  const resetPermissions = () => {
    cameraPermissionState.value = 'unknown'
    microphonePermissionState.value = 'unknown'
  }

  /**
   * Intenta revocar permisos si es posible (experimental)
   * NOTA: La revocación programática no está soportada en la mayoría de navegadores
   */
  const revokePermissions = async (): Promise<void> => {
    try {
      // Intentar detener todos los streams activos
      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log('[CameraPermissions] Dispositivos disponibles:', devices.length)

      // Resetear estado local
      resetPermissions()

      console.log('[CameraPermissions] Estado de permisos reseteado')
    } catch (error) {
      console.warn('[CameraPermissions] No se pudo enumerar dispositivos:', error)
    }
  }

  /**
   * Obtiene instrucciones para reactivar permisos según el navegador
   */
  const getPermissionInstructions = (): string => {
    const userAgent = navigator.userAgent.toLowerCase()

    if (userAgent.includes('chrome')) {
      return 'Chrome: Haz clic en el icono de candado/cámara en la barra de direcciones y selecciona "Permitir" para cámara y micrófono.'
    } else if (userAgent.includes('firefox')) {
      return 'Firefox: Haz clic en el icono de cámara en la barra de direcciones y selecciona "Permitir temporalmente" o "Permitir siempre".'
    } else if (userAgent.includes('safari')) {
      return 'Safari: Ve a Ajustes del sitio web > Cámara/Micrófono y selecciona "Permitir".'
    } else if (userAgent.includes('edge')) {
      return 'Edge: Haz clic en el icono de candado/cámara en la barra de direcciones y selecciona "Permitir" para cámara y micrófono.'
    } else {
      return 'Haz clic en el icono de permisos en la barra de direcciones del navegador y permite el acceso a cámara y micrófono.'
    }
  }

  // ============================================================================
  // RETURN - API pública del composable
  // ============================================================================
  return {
    // Estado
    cameraPermissionState,
    microphonePermissionState,
    checkingPermissions,
    requestingPermissions,

    // Computed
    isCameraGranted,
    isCameraDenied,
    isCameraPrompt,
    isMicrophoneGranted,
    isMicrophoneDenied,
    arePermissionsGranted,
    arePermissionsDenied,

    // Métodos
    checkCameraPermission,
    checkMicrophonePermission,
    checkAllPermissions,
    requestCameraPermissions,
    resetPermissions,
    getPermissionInstructions
  }
}
