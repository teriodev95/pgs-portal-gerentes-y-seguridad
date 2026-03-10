<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useStore } from '@/shared/stores'
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
  verificationMessage: string
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

// Composable unificado
const {
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
  uploadVerificationVideo,
  isAgentVerificationCompleted,
  isGerentVerificationCompleted
} = useSignWeeklyClose()

const videoPlayerRef = ref<InstanceType<typeof VideoPlayer>>()

// Estado local de upload
const uploadStatus = ref<'success' | 'error' | 'uploading' | 'idle'>('idle')
const isVideoUploading = computed(() => uploadStatus.value === 'uploading')

const showRecordingButtons = computed(
  () => startCamera.value && uploadStatus.value !== 'success'
)

const verificationCompleted = computed(() => {
  if ($props.mode === 'agente') {
    return isAgentVerificationCompleted.value
  } else {
    return isGerentVerificationCompleted.value
  }
})

// Watchers
watch(uploadStatus, (newValue) => {
  if (newValue === 'success') {
    $emit('uploaded')
  }
})

// Methods
const handleUpload = async () => {
  if (!videoBlobFile.value) return
  if (uploadStatus.value === 'uploading') return // Prevenir múltiples clics

  uploadStatus.value = 'uploading'

  const userType = $props.mode === 'agente' ? 'agente' : 'gerente'
  const result = await uploadVerificationVideo(userType, fileName.value)

  if (result || result === null) {
    // Si fue exitoso o hubo error pero se guardó localmente
    uploadStatus.value = 'success'

    // Marcar la verificación como completada
    if (userType === 'agente') {
      $signStore.verificacionCompletadaAgente = true
    } else if (userType === 'gerente') {
      $signStore.verificacionCompletadaGerente = true
    }

    $emit('uploaded')
  } else {
    uploadStatus.value = 'error'
  }
}

const handleStartCameraWithReset = () => {
  uploadStatus.value = 'idle'
  handleStartCamera()
}

// Sincronizar refs del VideoPlayer con el composable
watch([videoPlayerRef], () => {
  if (videoPlayerRef.value) {
    videoLive.value = videoPlayerRef.value.videoLive
    videoRecorded.value = videoPlayerRef.value.videoRecorded
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
        :message="$props.verificationMessage"
        :visible="showInformationalMessage"
      />

      <!-- VIDEO -->
      <VideoPlayer
        v-if="startCamera"
        ref="videoPlayerRef"
        :show-live-video="showVideoLive"
        :show-recorded-video="showVideoRecorded"
        :is-camera-open="isCameraOpen"
        :verification-message="$props.verificationMessage"
      />

      <!-- CONTROLS -->
      <CameraControls
        :start-camera="startCamera"
        :is-camera-open="isCameraOpen"
        :is-video-recorded="isVideoRecorded"
        :is-video-uploading="isVideoUploading"
        :show-recording-buttons="showRecordingButtons"
        @start-camera="handleStartCameraWithReset"
        @record="toggleCameraRecording"
        @upload="handleUpload"
      />
    </div>
  </div>
</template>