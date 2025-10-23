<script setup lang="ts">
import { computed } from 'vue'
import NotificationCard from '@/shared/components/NotificationCard.vue'

interface Props {
  uploadStatus: 'success' | 'error' | 'uploading' | 'idle' | ''
  verificationCompleted: boolean
}

const $props = defineProps<Props>()

const notificationTitle = computed<string>(() => {
  if ($props.uploadStatus === 'success' || $props.verificationCompleted) {
    return 'Verificación Facial y de Voz Completa'
  } else {
    return 'Error en la Verificación'
  }
})

const notificationMsg = computed<string>(() => {
  if ($props.uploadStatus === 'success' || $props.verificationCompleted) {
    return `Para futuras auditorías, recuerda:
        <br />
        Pronuncia claramente la palabra solicitada.
        <br />
        Asegúrate de que tu rostro sea visible en el video. Un video incorrecto puede resultar en
        penalizaciones.`
  } else {
    return `Hubo un error, asegúrate de contar con conexión a internet.
        <br />
        De lo contrario, verifica que tienes datos móviles.
        <br />
        Vuelve a intentarlo.`
  }
})

const showSuccessNotification = computed(() =>
  $props.uploadStatus === 'success' || $props.verificationCompleted
)

const showErrorNotification = computed(() =>
  $props.uploadStatus === 'error'
)
</script>

<template>
  <div>
    <NotificationCard
      v-if="showSuccessNotification"
      type="success"
      :title="notificationTitle"
      :msg="notificationMsg"
    />

    <NotificationCard
      v-if="showErrorNotification"
      type="error"
      :title="notificationTitle"
      :msg="notificationMsg"
    />
  </div>
</template>