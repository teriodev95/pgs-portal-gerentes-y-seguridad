<script setup lang="ts">
import ActionButton from '@/shared/components/ActionButton.vue'
import IconCamera from '@/shared/components/icons/CameraIcon.vue'
import UploadIcon from '@/shared/components/icons/UploadIcon.vue'
import ArrowRight from '@/shared/components/icons/ArrowRight.vue'

interface Props {
  startCamera: boolean
  isCameraOpen: boolean
  isVideoRecorded: boolean
  isVideoUploading: boolean
  showRecordingButtons: boolean
}

interface Emit {
  (e: 'start-camera'): void
  (e: 'record'): void
  (e: 'upload'): void
}

defineProps<Props>()
const $emit = defineEmits<Emit>()
</script>

<template>
  <div class="space-y-4">
    <!-- BTN INICIAR CAMARA -->
    <ActionButton
      v-show="!startCamera"
      variant="primary"
      full-width
      @click="$emit('start-camera')"
    >
      Iniciar camara
      <ArrowRight class="size-5" />
    </ActionButton>

    <!-- BTN CONTROLES GRABACION -->
    <ActionButton
      v-show="showRecordingButtons"
      :variant="isCameraOpen ? 'danger' : 'primary'"
      :disabled="isVideoUploading"
      :loading="isVideoUploading"
      full-width
      @click="$emit('record')"
    >
      <template v-if="isCameraOpen">
        Detener
      </template>
      <template v-else>
        {{ isVideoRecorded ? 'Iniciar Nuevamente' : 'Grabar verificación facial' }}
        <IconCamera class="size-5" />
      </template>
    </ActionButton>

    <!-- BTN SUBIR GRABACION -->
    <ActionButton
      v-show="isVideoRecorded"
      variant="success"
      :disabled="isVideoUploading"
      :loading="isVideoUploading"
      full-width
      @click="$emit('upload')"
    >
      Subir verificación
      <UploadIcon v-if="!isVideoUploading" class="size-5" />
    </ActionButton>
  </div>
</template>