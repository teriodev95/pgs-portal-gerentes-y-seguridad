import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useSignStore } from '../stores'
import { useWeeklyCloseApi } from './useWeeklyCloseApi'
import { blob2base64 } from '@/shared/utils'
import { useCameraPermissions } from '@/shared/composables/useCameraPermissions'
import { useNotification } from '@/shared/composables/useNotification'

/**
 * Constants
 */
const RECORDING_DURATION_MS = 5500
const VIDEO_MIME_TYPE = 'video/webm'
const VIDEO_UPLOAD_ERROR_MESSAGE = 'upload_error'

/**
 * Types
 */
type UserType = 'agente' | 'gerente' | 'seguridad'
type CameraState = 'idle' | 'initializing' | 'recording' | 'uploading' | 'completed' | 'error'

/**
 * Verification message fruits
 */
const VERIFICATION_FRUITS = [
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
] as const

/**
 * Composable for camera recording and video upload
 *
 * RESPONSIBILITIES:
 * - Camera stream management (MediaRecorder API)
 * - Video recording (start/stop)
 * - Video upload to API
 * - Verification message generation
 * - Camera permissions handling
 */
export const useCameraRecording = () => {
  const signStore = useSignStore()
  const api = useWeeklyCloseApi()
  const { showError, showSuccess, showWarning } = useNotification()

  // ============================================================================
  // STATE - Video Elements
  // ============================================================================
  const liveVideoElement = ref<HTMLVideoElement>()
  const recordedVideoElement = ref<HTMLVideoElement>()
  const recordedVideoBlob = ref<Blob>()

  // ============================================================================
  // STATE - Camera & Recording
  // ============================================================================
  const cameraStream = ref<MediaStream>()
  const mediaRecorder = ref<MediaRecorder>()
  const isCameraOpen = ref(false)
  const isVideoRecorded = ref(false)
  const isCameraInitialized = ref(false)
  const showInstructionalMessage = ref(false)
  const currentState = ref<CameraState>('idle')

  // Timeout para detener grabación automáticamente
  let stopTimeoutId: ReturnType<typeof setTimeout> | null = null

  // ============================================================================
  // STATE - Camera Permissions
  // ============================================================================
  const {
    isCameraGranted,
    isCameraDenied,
    arePermissionsDenied,
    checkAllPermissions,
    requestCameraPermissions,
    resetPermissions,
    getPermissionInstructions
  } = useCameraPermissions()

  // ============================================================================
  // STATE - Verification Message
  // ============================================================================
  const verificationSeed = ref(uuidv4())

  // ============================================================================
  // COMPUTED
  // ============================================================================
  const showLiveVideo = computed(() => !isVideoRecorded.value)
  const showRecordedVideo = computed(() => isVideoRecorded.value)
  const isRecording = computed(() => currentState.value === 'recording')
  const isUploading = computed(() => currentState.value === 'uploading')

  // ============================================================================
  // METHODS - Verification Message
  // ============================================================================

  /**
   * Generates a seeded random number for verification
   */
  const seededRandom = (seed: string): number => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return (hash & 0x7fffffff) / 0x7fffffff
  }

  /**
   * Generates a random number within range using seed
   */
  const getRandomNumber = (min: number, max: number, seed: string): number => {
    return Math.floor(seededRandom(seed) * (max - min + 1)) + min
  }

  /**
   * Gets a random fruit using seed
   */
  const getRandomFruit = (seed: string) => {
    return VERIFICATION_FRUITS[Math.floor(seededRandom(seed) * VERIFICATION_FRUITS.length)]
  }

  /**
   * Generates verification message with fruit emoji and random number
   */
  const verificationMessage = computed(() => {
    const randomFruit = getRandomFruit(verificationSeed.value)
    const randomNumber = getRandomNumber(10, 100, verificationSeed.value)
    return `${randomFruit.emoji} ${randomFruit.name} ${randomNumber}`
  })

  /**
   * Regenerates verification message with new seed
   */
  const regenerateVerificationMessage = () => {
    verificationSeed.value = uuidv4()
  }

  // ============================================================================
  // METHODS - Timeout Management
  // ============================================================================

  /**
   * Clears recording timeout
   */
  const clearTimeouts = () => {
    if (stopTimeoutId) {
      clearTimeout(stopTimeoutId)
      stopTimeoutId = null
    }
  }

  // ============================================================================
  // METHODS - Camera Recording
  // ============================================================================

  /**
   * Initializes camera (shows instructional message)
   */
  const initializeCamera = async () => {
    isCameraInitialized.value = true
    showInstructionalMessage.value = true
  }

  /**
   * Starts or stops camera recording
   */
  const toggleRecording = async (): Promise<void> => {
    clearTimeouts()
    showInstructionalMessage.value = false

    if (!liveVideoElement.value || !recordedVideoElement.value) {
      showError('Referencias de video no disponibles')
      return
    }

    isCameraOpen.value = !isCameraOpen.value

    if (isCameraOpen.value) {
      // START RECORDING
      isVideoRecorded.value = false
      currentState.value = 'recording'

      try {
        // Close any previous stream
        if (cameraStream.value) {
          cameraStream.value.getTracks().forEach((track) => track.stop())
          cameraStream.value = undefined
        }

        // Reset permissions to avoid browser caching
        resetPermissions()

        // Request camera permissions
        const stream = await requestCameraPermissions(false)

        if (!stream) {
          // Permissions denied, revert state
          isCameraOpen.value = false
          currentState.value = 'idle'
          return
        }

        cameraStream.value = stream

        // Check if video/webm is supported
        if (!MediaRecorder.isTypeSupported(VIDEO_MIME_TYPE)) {
          showWarning('video/webm no es soportado, se usará formato por defecto')
        }

        mediaRecorder.value = new MediaRecorder(cameraStream.value, {
          mimeType: VIDEO_MIME_TYPE
        })

        liveVideoElement.value.srcObject = cameraStream.value
        mediaRecorder.value.start()

        // Auto-stop after RECORDING_DURATION_MS
        stopTimeoutId = setTimeout(() => {
          toggleRecording()
        }, RECORDING_DURATION_MS)

        // Handle recorded data
        mediaRecorder.value.addEventListener('dataavailable', (event) => {
          if (recordedVideoElement.value) {
            recordedVideoElement.value.src = URL.createObjectURL(event.data)
            recordedVideoBlob.value = event.data
          }
        })
      } catch (error) {
        currentState.value = 'error'
        isCameraOpen.value = false
        showError('No se pudo acceder a la cámara')
        console.error('Error accessing camera:', error)
      }
    } else {
      // STOP RECORDING
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
   * Resets recording state
   */
  const resetRecording = () => {
    clearTimeouts()
    isVideoRecorded.value = false
    isCameraOpen.value = false
    isCameraInitialized.value = false
    showInstructionalMessage.value = false
    recordedVideoBlob.value = undefined
    currentState.value = 'idle'
  }

  // ============================================================================
  // METHODS - Video Upload
  // ============================================================================

  /**
   * Uploads verification video to API
   */
  const uploadVideo = async (
    userType: UserType,
    fileName: string
  ): Promise<string | null> => {
    if (!recordedVideoBlob.value) {
      showWarning('No hay video para subir')

      // Continue flow even without video
      const errorUrl = VIDEO_UPLOAD_ERROR_MESSAGE
      if (userType === 'agente') {
        signStore.agentVerificationVideoUrl = errorUrl
        signStore.agentSignature = ''
      } else if (userType === 'gerente') {
        signStore.managerVerificationVideoUrl = errorUrl
        signStore.managerSignature = ''
      }

      return null
    }

    try {
      currentState.value = 'uploading'

      // Convert blob to base64 for local storage
      const fileBase64 = await blob2base64(recordedVideoBlob.value)

      // Upload video to API
      const videoFile = new File([recordedVideoBlob.value], fileName, { type: 'video/mp4' })
      const response = await api.uploadVideo(videoFile)

      // Save to store based on user type
      if (userType === 'agente') {
        signStore.agentSignature = fileBase64
        signStore.agentVerificationVideoUrl = response.videoUrl
      } else if (userType === 'gerente') {
        signStore.managerSignature = fileBase64
        signStore.managerVerificationVideoUrl = response.videoUrl
      }

      currentState.value = 'completed'
      showSuccess('Video subido correctamente')

      return response.videoUrl
    } catch (error) {
      console.error('Error uploading video:', error)

      // Continue flow even with error
      const fileBase64 = await blob2base64(recordedVideoBlob.value).catch(() => '')
      const errorUrl = VIDEO_UPLOAD_ERROR_MESSAGE

      if (userType === 'agente') {
        signStore.agentSignature = fileBase64
        signStore.agentVerificationVideoUrl = errorUrl
      } else if (userType === 'gerente') {
        signStore.managerSignature = fileBase64
        signStore.managerVerificationVideoUrl = errorUrl
      }

      currentState.value = 'idle'
      showWarning('Video guardado localmente, continúa el proceso')

      return null
    }
  }

  // ============================================================================
  // RETURN - Public API
  // ============================================================================
  return {
    // Video elements
    liveVideoElement,
    recordedVideoElement,
    recordedVideoBlob,

    // Camera state
    isCameraOpen,
    isVideoRecorded,
    isCameraInitialized,
    showInstructionalMessage,
    currentState,

    // Computed state
    showLiveVideo,
    showRecordedVideo,
    isRecording,
    isUploading,

    // Verification message
    verificationMessage,
    regenerateVerificationMessage,

    // Camera methods
    initializeCamera,
    toggleRecording,
    resetRecording,

    // Upload methods
    uploadVideo,

    // Permission methods
    isCameraGranted,
    isCameraDenied,
    arePermissionsDenied,
    checkAllPermissions,
    resetPermissions,
    getPermissionInstructions
  }
}
