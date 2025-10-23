import { ref, computed } from 'vue'
import { useToast } from 'vue-toast-notification'

export function useCameraRecording() {
  const $toast = useToast()

  const cameraStream = ref<MediaStream>()
  const mediaRecorder = ref<MediaRecorder>()
  const videoLive = ref<HTMLVideoElement>()
  const videoRecorded = ref<HTMLVideoElement>()
  const videoBlobFile = ref<Blob>()

  const isCameraOpen = ref(false)
  const isVideoRecorded = ref(false)
  const startCamera = ref(false)
  const showIformationalMessage = ref<boolean>(false)

  let stopTimeoutId: ReturnType<typeof setTimeout> | null = null

  const showVideoLive = computed(() => !isVideoRecorded.value)
  const showVideoRecorded = computed(() => isVideoRecorded.value)

  const clearTimeouts = () => {
    if (stopTimeoutId) {
      clearTimeout(stopTimeoutId)
      stopTimeoutId = null
    }
  }

  const handleStartCamera = () => {
    startCamera.value = true
    showIformationalMessage.value = true
  }

  const onClickCameraRecord = async () => {
    clearTimeouts()
    showIformationalMessage.value = false

    if (videoLive.value && videoRecorded.value) {
      isCameraOpen.value = !isCameraOpen.value

      if (isCameraOpen.value) {
        isVideoRecorded.value = false

        cameraStream.value = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        if (!MediaRecorder.isTypeSupported('video/webm')) {
          $toast.warning('video/webm is not supported')
        }

        mediaRecorder.value = new MediaRecorder(cameraStream.value, {
          mimeType: 'video/webm'
        })
        videoLive.value.srcObject = cameraStream.value

        mediaRecorder.value.start()

        stopTimeoutId = setTimeout(() => {
          onClickCameraRecord()
        }, 5500)

        mediaRecorder.value.addEventListener('dataavailable', (event) => {
          if (videoRecorded.value) {
            videoRecorded.value.src = URL.createObjectURL(event.data)
            videoBlobFile.value = event.data
          }
        })
      } else {
        mediaRecorder.value?.stop()
        mediaRecorder.value = undefined

        if (cameraStream.value) {
          cameraStream.value.getTracks().forEach((track) => {
            track.stop()
          })
        }
        cameraStream.value = undefined
        isVideoRecorded.value = true
      }
    }
  }

  const resetRecording = () => {
    clearTimeouts()
    isVideoRecorded.value = false
    isCameraOpen.value = false
    startCamera.value = false
    showIformationalMessage.value = false
    videoBlobFile.value = undefined
  }

  return {
    // Refs
    cameraStream,
    mediaRecorder,
    videoLive,
    videoRecorded,
    videoBlobFile,
    isCameraOpen,
    isVideoRecorded,
    startCamera,
    showIformationalMessage,

    // Computed
    showVideoLive,
    showVideoRecorded,

    // Methods
    handleStartCamera,
    onClickCameraRecord,
    resetRecording,
    clearTimeouts
  }
}