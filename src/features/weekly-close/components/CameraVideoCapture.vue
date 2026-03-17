<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { useCameraRecording } from '../composables/useCameraRecording'
import { useSignWeeklyClose } from '../composables/useSignWeeklyClose'
import { useSignStore } from '../stores'
import type { IAgencyDashboard } from '@/shared/types'

// Components
import VerificationMessage from './VerificationMessage.vue'
import VideoPlayer from './VideoPlayer.vue'
import CameraNotifications from './CameraNotifications.vue'
import CameraControls from './CameraControls.vue'

// Utils
interface Emit {
  (e: 'uploaded', url?: string | undefined): void
}
const $emit = defineEmits<Emit>()

const $props = defineProps<{
  mode: 'agente' | 'gerente'
}>()

// Helpers
const $store = useStore()
const $signStore = useSignStore()

// Data
const agency = computed(() => $store.agencyData as IAgencyDashboard)
const fileName = computed(() => {
  const time = new Date()
  const formattedDate = time.toLocaleDateString('de-DE')
  const timestamp = time.getTime()
  return `${agency.value.agencia}-SEM${$store.currentDate.week}-${$props.mode.charAt(0).toUpperCase()}-${formattedDate}-${timestamp}.webm`
})

// Camera composable
const {
  liveVideoElement,
  recordedVideoElement,
  recordedVideoBlob,
  isCameraOpen,
  isVideoRecorded,
  isCameraInitialized,
  showInstructionalMessage,
  showLiveVideo,
  showRecordedVideo,
  isUploading,
  verificationMessage,
  initializeCamera,
  toggleRecording,
  resetRecording,
  uploadVideo
} = useCameraRecording()

// Sign composable (para verificaciones)
const {
  isAgentVerificationCompleted,
  isManagerVerificationCompleted
} = useSignWeeklyClose()

const videoPlayerRef = ref<InstanceType<typeof VideoPlayer>>()

// Estado local de upload
const uploadStatus = ref<'success' | 'error' | 'uploading' | 'idle'>('idle')

const showRecordingButtons = computed(
  () => isCameraInitialized.value && uploadStatus.value !== 'success'
)

const verificationCompleted = computed(() => {
  if ($props.mode === 'agente') {
    return isAgentVerificationCompleted.value
  } else {
    return isManagerVerificationCompleted.value
  }
})

// Watchers
watch(uploadStatus, (newValue) => {
  if (newValue === 'success') {
    $emit('uploaded')
  }
})

watch(isUploading, (newValue) => {
  if (newValue) {
    uploadStatus.value = 'uploading'
  }
})

// Methods
const handleUpload = async () => {
  if (!recordedVideoBlob.value) return
  if (uploadStatus.value === 'uploading') return // Prevenir múltiples clics

  uploadStatus.value = 'uploading'

  const userType = $props.mode === 'agente' ? 'agente' : 'gerente'
  const result = await uploadVideo(userType, fileName.value)

  if (result || result === null) {
    // Si fue exitoso o hubo error pero se guardó localmente
    uploadStatus.value = 'success'

    // Marcar la verificación como completada
    if (userType === 'agente') {
      $signStore.isAgentVerificationCompleted = true
    } else if (userType === 'gerente') {
      $signStore.isManagerVerificationCompleted = true
    }

    $emit('uploaded')
  } else {
    uploadStatus.value = 'error'
  }
}

const handleStartCameraWithReset = () => {
  uploadStatus.value = 'idle'
  resetRecording()
  initializeCamera()
}

// Sincronizar refs del VideoPlayer con el composable
watch([videoPlayerRef], () => {
  if (videoPlayerRef.value) {
    liveVideoElement.value = videoPlayerRef.value.videoLive
    recordedVideoElement.value = videoPlayerRef.value.videoRecorded
  }
}, { immediate: true })
</script>

<template>
  <div class="relative space-y-4">
    <!-- NOTIFICATIONS -->
    <CameraNotifications
      :upload-status="uploadStatus"
      :verification-completed="verificationCompleted"
    />

    <div v-if="uploadStatus !== 'success' && !verificationCompleted" class="space-y-6">
      <!-- VERIFICATION MESSAGE -->
      <VerificationMessage
        :message="verificationMessage"
        :visible="showInstructionalMessage"
      />

      <!-- VIDEO -->
      <VideoPlayer
        v-if="isCameraInitialized"
        ref="videoPlayerRef"
        :show-live-video="showLiveVideo"
        :show-recorded-video="showRecordedVideo"
        :is-camera-open="isCameraOpen"
        :verification-message="verificationMessage"
      />

      <!-- CONTROLS -->
      <CameraControls
        :start-camera="isCameraInitialized"
        :is-camera-open="isCameraOpen"
        :is-video-recorded="isVideoRecorded"
        :is-video-uploading="isUploading"
        :show-recording-buttons="showRecordingButtons"
        @start-camera="handleStartCameraWithReset"
        @record="toggleRecording"
        @upload="handleUpload"
      />
    </div>
  </div>
</template>