import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { v4 as uuidv4 } from 'uuid'
import { useSignStore, useCierreSemanalStore } from '../stores'
import { useStore } from '@/shared/stores'
import { useWeeklyCloseApi } from './useWeeklyCloseApi'
import { blob2base64 } from '@/shared/utils'
import { securityPinService } from '@/features/security-pin/services/security.service'
import { STEPS } from '../constants'
import { WEEKLY_CLOSE_ERROR_MESSAGES } from '../constants/errorMessages'
import { ROUTE_NAME } from '@/router'

/**
 * Tipos para el flujo de firma
 */
type SignFlowState =
  | 'idle'
  | 'validating-pin'
  | 'capturing-video'
  | 'uploading-video'
  | 'submitting'
  | 'completed'
  | 'error'

type UserType = 'agente' | 'gerente' | 'seguridad'

/**
 * Composable para orquestar el proceso completo de firma del cierre semanal
 *
 * RESPONSABILIDADES:
 * - Orquestar el proceso completo de firma del cierre
 * - Validación del PIN (agente, gerente, seguridad)
 * - Flujo de envío tras firma
 * - Mensajes de verificación/feedback
 * - Navegación entre pasos
 * - Manejar estados: idle → validating → submitting → done/error
 *
 * NOTA: Usa useCameraRecording y useVideoUpload externamente
 */
export const useSignWeeklyClose = () => {
  const router = useRouter()
  const toast = useToast()
  const signStore = useSignStore()
  const globalStore = useStore()
  const cierreSemanalStore = useCierreSemanalStore()
  const api = useWeeklyCloseApi()

  // ============================================================================
  // ESTADO - Flujo general
  // ============================================================================
  const currentState = ref<SignFlowState>('idle')
  const currentStep = ref<STEPS>(STEPS.HOME)
  const error = ref<string | null>(null)

  // ============================================================================
  // ESTADO - Validación de PIN
  // ============================================================================
  const agentPin = ref('')
  const gerentPin = ref('')
  const securityPin = ref('')
  const isAgentPinValid = ref(false)
  const isGerentPinValid = ref(false)

  // ============================================================================
  // ESTADO - Captura de video con cámara
  // ============================================================================
  const cameraStream = ref<MediaStream>()
  const mediaRecorder = ref<MediaRecorder>()
  const videoLive = ref<HTMLVideoElement>()
  const videoRecorded = ref<HTMLVideoElement>()
  const videoBlobFile = ref<Blob>()
  const isCameraOpen = ref(false)
  const isVideoRecorded = ref(false)
  const startCamera = ref(false)
  const showInformationalMessage = ref(false)

  let stopTimeoutId: ReturnType<typeof setTimeout> | null = null

  // ============================================================================
  // ESTADO - Confirmación y envío
  // ============================================================================
  const isSubmitting = ref(false)
  const verifyWeeklyClosing = ref(false)
  const showConfirmationAnimation = ref(false)

  // ============================================================================
  // ESTADO - Mensaje de verificación (absorbe useVerificationMessage)
  // ============================================================================
  const verificationSeed = ref(uuidv4())

  const fruits = [
    { emoji: '🍍', name: 'Piña' },
    { emoji: '🍎', name: 'Manzana' },
    { emoji: '🍉', name: 'Sandía' },
    { emoji: '🍇', name: 'Uva' },
    { emoji: '🍒', name: 'Cereza' },
    { emoji: '🍓', name: 'Fresa' },
    { emoji: '🍑', name: 'Durazno' },
    { emoji: '🍊', name: 'Naranja' },
    { emoji: '🍋', name: 'Limón' },
    { emoji: '🍈', name: 'Melón' },
    { emoji: '🍐', name: 'Pera' },
    { emoji: '🥭', name: 'Mango' },
    { emoji: '🥥', name: 'Coco' },
    { emoji: '🍅', name: 'Tomate' },
    { emoji: '🥝', name: 'Kiwi' }
  ]

  const seededRandom = (seed: string): number => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return (hash & 0x7fffffff) / 0x7fffffff
  }

  const getRandomNumber = (min: number, max: number, seed: string): number => {
    return Math.floor(seededRandom(seed) * (max - min + 1)) + min
  }

  const getRandomFruit = (seed: string): typeof fruits[0] => {
    return fruits[Math.floor(seededRandom(seed) * fruits.length)]
  }

  const verificationMessage = computed(() => {
    const randomFruit = getRandomFruit(verificationSeed.value)
    const randomNumber = getRandomNumber(10, 100, verificationSeed.value)
    return `${randomFruit.emoji} ${randomFruit.name} ${randomNumber}`
  })

  const regenerateVerificationMessage = () => {
    verificationSeed.value = uuidv4()
  }

  // ============================================================================
  // COMPUTED - Estado del flujo
  // ============================================================================
  const isIdle = computed(() => currentState.value === 'idle')
  const isValidatingPin = computed(() => currentState.value === 'validating-pin')
  const isCapturingVideo = computed(() => currentState.value === 'capturing-video')
  const isUploadingVideo = computed(() => currentState.value === 'uploading-video')
  const isSubmittingData = computed(() => currentState.value === 'submitting')
  const isCompleted = computed(() => currentState.value === 'completed')
  const hasError = computed(() => currentState.value === 'error')

  const showVideoLive = computed(() => !isVideoRecorded.value)
  const showVideoRecorded = computed(() => isVideoRecorded.value)

  // Verificaciones completadas desde el store
  const isAgentVerificationCompleted = computed(() => signStore.verificacionCompletadaAgente)
  const isGerentVerificationCompleted = computed(() => signStore.verificacionCompletadaGerente)
  const isAgencyVacant = computed(() => cierreSemanalStore.isAgencyVacant)

  const canSubmit = computed(() => {
    // Si la agencia está vacante, se puede enviar directamente
    if (isAgencyVacant.value) return true
    // De lo contrario, requiere ambas verificaciones
    return isAgentVerificationCompleted.value && isGerentVerificationCompleted.value
  })

  // ============================================================================
  // MÉTODOS - Validación de PIN
  // ============================================================================

  /**
   * Valida el PIN del agente
   */
  const validateAgentPin = (enteredPin: string, correctPin: string): boolean => {
    const isValid = enteredPin === correctPin
    isAgentPinValid.value = isValid

    if (!isValid) {
      error.value = 'PIN de agente incorrecto'
      toast.error('PIN incorrecto')
    } else {
      error.value = null
      toast.success('PIN validado correctamente')
    }

    return isValid
  }

  /**
   * Valida el PIN del gerente
   */
  const validateGerentPin = (enteredPin: string, correctPin: string): boolean => {
    const isValid = enteredPin === correctPin
    isGerentPinValid.value = isValid

    if (!isValid) {
      error.value = 'PIN de gerente incorrecto'
      toast.error('PIN incorrecto')
    } else {
      error.value = null
      toast.success('PIN validado correctamente')
    }

    return isValid
  }

  /**
   * Valida el PIN de seguridad (PIN temporal)
   */
  const validateSecurityPin = async (enteredPin: string): Promise<boolean> => {
    try {
      currentState.value = 'validating-pin'

      const { data: currentPin } = await securityPinService.checkPinExists(
        globalStore.gerenciaSelected as string
      )

      const firstPin = Object.values(currentPin.pins)[0] || { pin: '' }

      if (!firstPin.pin || enteredPin !== firstPin.pin) {
        throw new Error(WEEKLY_CLOSE_ERROR_MESSAGES.INVALID_OR_EXPIRED_PIN)
      }

      // Si el PIN es válido, marca la verificación del agente como completada
      signStore.verificacionCompletadaAgente = true
      toast.success('PIN de seguridad verificado correctamente')

      currentState.value = 'idle'
      return true
    } catch (error) {
      currentState.value = 'error'
      const errorMessage =
        error instanceof Error ? error.message : 'Error al validar PIN de seguridad'
      toast.error(errorMessage)
      return false
    }
  }

  // ============================================================================
  // MÉTODOS - Captura de video con cámara (absorbe useCameraRecording)
  // ============================================================================

  const clearTimeouts = () => {
    if (stopTimeoutId) {
      clearTimeout(stopTimeoutId)
      stopTimeoutId = null
    }
  }

  const handleStartCamera = () => {
    startCamera.value = true
    showInformationalMessage.value = true
  }

  /**
   * Inicia o detiene la grabación de video
   */
  const toggleCameraRecording = async (): Promise<void> => {
    clearTimeouts()
    showInformationalMessage.value = false

    if (!videoLive.value || !videoRecorded.value) {
      toast.error('Referencias de video no disponibles')
      return
    }

    isCameraOpen.value = !isCameraOpen.value

    if (isCameraOpen.value) {
      // Iniciar grabación
      isVideoRecorded.value = false
      currentState.value = 'capturing-video'

      try {
        cameraStream.value = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        if (!MediaRecorder.isTypeSupported('video/webm')) {
          toast.warning('video/webm no es soportado, se usará formato por defecto')
        }

        mediaRecorder.value = new MediaRecorder(cameraStream.value, {
          mimeType: 'video/webm'
        })

        videoLive.value.srcObject = cameraStream.value
        mediaRecorder.value.start()

        // Detener automáticamente después de 5.5 segundos
        stopTimeoutId = setTimeout(() => {
          toggleCameraRecording()
        }, 5500)

        mediaRecorder.value.addEventListener('dataavailable', (event) => {
          if (videoRecorded.value) {
            videoRecorded.value.src = URL.createObjectURL(event.data)
            videoBlobFile.value = event.data
          }
        })
      } catch (error) {
        currentState.value = 'error'
        toast.error('No se pudo acceder a la cámara')
        console.error('Error accessing camera:', error)
      }
    } else {
      // Detener grabación
      mediaRecorder.value?.stop()
      mediaRecorder.value = undefined

      if (cameraStream.value) {
        cameraStream.value.getTracks().forEach((track) => {
          track.stop()
        })
      }

      cameraStream.value = undefined
      isVideoRecorded.value = true
      currentState.value = 'idle'
    }
  }

  /**
   * Resetea la grabación de video
   */
  const resetRecording = () => {
    clearTimeouts()
    isVideoRecorded.value = false
    isCameraOpen.value = false
    startCamera.value = false
    showInformationalMessage.value = false
    videoBlobFile.value = undefined
  }

  // ============================================================================
  // MÉTODOS - Subida de video (absorbe useVideoUpload)
  // ============================================================================

  /**
   * Sube el video de verificación a la API
   */
  const uploadVerificationVideo = async (
    userType: UserType,
    fileName: string
  ): Promise<string | null> => {
    if (!videoBlobFile.value) {
      toast.warning('No hay video para subir')

      // Continuar el flujo incluso sin video
      const errorUrl = 'hubo un error en la subida'
      if (userType === 'agente') {
        signStore.uidVerificacionAgente = errorUrl
        signStore.firmaAgente = ''
      } else if (userType === 'gerente') {
        signStore.uidVerificacionGerente = errorUrl
        signStore.firmaGerente = ''
      }

      return null
    }

    try {
      currentState.value = 'uploading-video'

      // Convertir blob a base64 para almacenar localmente
      const fileBase64 = await blob2base64(videoBlobFile.value)

      // Subir video a la API
      const videoFile = new File([videoBlobFile.value], fileName, { type: 'video/mp4' })
      const response = await api.uploadVideo(videoFile)

      // Guardar en el store según el tipo de usuario
      if (userType === 'agente') {
        signStore.firmaAgente = fileBase64
        signStore.uidVerificacionAgente = response.videoUrl
      } else if (userType === 'gerente') {
        signStore.firmaGerente = fileBase64
        signStore.uidVerificacionGerente = response.videoUrl
      }

      currentState.value = 'idle'
      toast.success('Video subido correctamente')

      return response.videoUrl
    } catch (error) {
      console.error('Error uploading video:', error)

      // Continuar el flujo incluso con error
      const fileBase64 = await blob2base64(videoBlobFile.value).catch(() => '')
      const errorUrl = 'hubo un error en la subida'

      if (userType === 'agente') {
        signStore.firmaAgente = fileBase64
        signStore.uidVerificacionAgente = errorUrl
      } else if (userType === 'gerente') {
        signStore.firmaGerente = fileBase64
        signStore.uidVerificacionGerente = errorUrl
      }

      currentState.value = 'idle'
      toast.warning('Video guardado localmente, continúa el proceso')

      return null
    }
  }

  // ============================================================================
  // MÉTODOS - Navegación entre pasos (absorbe useStepNavigation)
  // ============================================================================

  const goToStep = (step: STEPS) => {
    currentStep.value = step
  }

  const goHome = () => goToStep(STEPS.HOME)
  const goToAgentStep = () => goToStep(STEPS.AGENT_PIN_CAMERA)
  const goToGerentStep = () => goToStep(STEPS.GERENT_PIN_CAMERA)

  // ============================================================================
  // MÉTODOS - Flujo de verificación completo
  // ============================================================================

  /**
   * Completa la verificación para un usuario
   */
  const completeVerification = (userType: UserType) => {
    if (userType === 'agente') {
      signStore.verificacionCompletadaAgente = true
    } else if (userType === 'gerente') {
      signStore.verificacionCompletadaGerente = true
    }

    resetRecording()
    goHome()
  }

  /**
   * Maneja la confirmación final antes de enviar
   */
  const handleConfirmation = (confirmed: boolean) => {
    verifyWeeklyClosing.value = confirmed
  }

  /**
   * Maneja el envío final del cierre (absorbe useSubmissionFlow)
   */
  const handleSubmit = async (
    saveWeeklyCloseFn: () => Promise<boolean>
  ): Promise<boolean> => {
    if (!verifyWeeklyClosing.value) {
      showConfirmationAnimation.value = true
      setTimeout(() => {
        showConfirmationAnimation.value = false
      }, 1000)
      toast.warning('Debes confirmar el cierre antes de continuar')
      return false
    }

    try {
      currentState.value = 'submitting'
      isSubmitting.value = true
      error.value = null

      const success = await saveWeeklyCloseFn()

      if (success) {
        currentState.value = 'completed'
        return true
      } else {
        currentState.value = 'error'
        return false
      }
    } catch (err) {
      currentState.value = 'error'
      error.value = err instanceof Error ? err.message : 'Error desconocido al enviar'
      toast.error('Error al completar el cierre semanal')
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Navega de regreso a la vista principal de cierre
   */
  const navigateBackToWeeklyClose = () => {
    router.push({ name: ROUTE_NAME.WEEKLY_CLOSE })
  }

  /**
   * Reinicia todo el estado del flujo de firma
   */
  const resetSignFlow = () => {
    currentState.value = 'idle'
    currentStep.value = STEPS.HOME
    error.value = null

    agentPin.value = ''
    gerentPin.value = ''
    securityPin.value = ''
    isAgentPinValid.value = false
    isGerentPinValid.value = false

    resetRecording()

    isSubmitting.value = false
    verifyWeeklyClosing.value = false
    showConfirmationAnimation.value = false

    signStore.resetValues()
  }

  // ============================================================================
  // RETURN - API pública del composable
  // ============================================================================
  return {
    // Estado del flujo
    currentState,
    currentStep,
    error,
    isIdle,
    isValidatingPin,
    isCapturingVideo,
    isUploadingVideo,
    isSubmittingData,
    isCompleted,
    hasError,

    // Estado de verificaciones
    isAgentVerificationCompleted,
    isGerentVerificationCompleted,
    canSubmit,

    // Validación de PIN
    agentPin,
    gerentPin,
    securityPin,
    isAgentPinValid,
    isGerentPinValid,
    validateAgentPin,
    validateGerentPin,
    validateSecurityPin,

    // Captura de video con cámara
    videoLive,
    videoRecorded,
    videoBlobFile,
    isCameraOpen,
    isVideoRecorded,
    startCamera,
    showInformationalMessage,
    showVideoLive,
    showVideoRecorded,
    handleStartCamera,
    toggleCameraRecording,
    resetRecording,

    // Subida de video
    uploadVerificationVideo,

    // Navegación entre pasos
    goToStep,
    goHome,
    goToAgentStep,
    goToGerentStep,

    // Mensaje de verificación
    verificationMessage,
    regenerateVerificationMessage,

    // Confirmación y envío
    verifyWeeklyClosing,
    showConfirmationAnimation,
    isSubmitting,
    handleConfirmation,
    handleSubmit,

    // Completar verificación
    completeVerification,

    // Navegación
    navigateBackToWeeklyClose,

    // Reset
    resetSignFlow
  }
}
