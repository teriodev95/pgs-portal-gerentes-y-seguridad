<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { useSignStore } from '@/features/weekly-close/stores'
import type { IAgencyDashboard } from '@/shared/types'
import { useVerificationMessage } from '../composables/useVerificationMessage'
import { useCameraRecording } from '../composables/useCameraRecording'
import { useVideoUpload } from '../composables/useVideoUpload'

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
const $sign = useSignStore()
const $store = useStore()

// Data
const agency = computed(() => $store.agencyData as IAgencyDashboard)
const fileName = computed(() => {
  const time = new Date()
  const formattedDate = time.toLocaleDateString('de-DE')
  const timestamp = time.getTime()
  return `${agency.value.agencia}-SEM${$store.currentDate.week}-${$props.mode.charAt(0).toUpperCase()}-${formattedDate}-${timestamp}.webm`
})


const showRecordingButtons = computed(
  () => !isVideoUploading.value && startCamera.value && uploadStatus.value !== 'success'
)

const verificacionCompletadaAgente = computed(() => $sign.verificacionCompletadaAgente)
const verificacionCompletadaGerente = computed(() => $sign.verificacionCompletadaGerente)
const verificationCompleted = computed(() => {
  if ($props.mode === 'agente') {
    return verificacionCompletadaAgente.value
  } else {
    return verificacionCompletadaGerente.value
  }
})

// Composables implementation
const { verificationMessage } = useVerificationMessage()
const {
  videoLive,
  videoRecorded,
  videoBlobFile,
  isCameraOpen,
  isVideoRecorded,
  startCamera,
  showIformationalMessage,
  showVideoLive,
  showVideoRecorded,
  handleStartCamera,
  onClickCameraRecord
} = useCameraRecording()

const videoPlayerRef = ref<InstanceType<typeof VideoPlayer>>()

const {
  isVideoUploading,
  uploadStatus,
  onClickUpload,
  resetUploadStatus
} = useVideoUpload()

// Watchers
watch(uploadStatus, (newValue) => {
  newValue === 'success'
    ? updateVerificationStatus($props.mode, true)
    : updateVerificationStatus($props.mode, false)
})

// Methods

const handleUpload = () => {
  onClickUpload({
    videoBlobFile: videoBlobFile.value,
    fileName: fileName.value,
    mode: $props.mode,
    emit: $emit
  })
}

const handleStartCameraWithReset = () => {
  resetUploadStatus()
  handleStartCamera()
}

// Sincronizar refs del VideoPlayer con el composable
watch([videoPlayerRef], () => {
  if (videoPlayerRef.value) {
    videoLive.value = videoPlayerRef.value.videoLive
    videoRecorded.value = videoPlayerRef.value.videoRecorded
  }
}, { immediate: true })

const updateVerificationStatus = (mode: 'agente' | 'gerente', value: boolean) => {
  if (mode === 'agente') {
    $sign.verificacionCompletadaAgente = value
  } else {
    $sign.verificacionCompletadaGerente = value
  }
}
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
        :visible="showIformationalMessage"
      />

      <!-- VIDEO -->
      <VideoPlayer
        v-if="startCamera"
        ref="videoPlayerRef"
        :show-live-video="showVideoLive"
        :show-recorded-video="showVideoRecorded"
        :is-camera-open="isCameraOpen"
        :verification-message="verificationMessage"
      />

      <!-- CONTROLS -->
      <CameraControls
        :start-camera="startCamera"
        :is-camera-open="isCameraOpen"
        :is-video-recorded="isVideoRecorded"
        :is-video-uploading="isVideoUploading"
        :show-recording-buttons="showRecordingButtons"
        @start-camera="handleStartCameraWithReset"
        @record="onClickCameraRecord"
        @upload="handleUpload"
      />
    </div>
  </div>
</template>