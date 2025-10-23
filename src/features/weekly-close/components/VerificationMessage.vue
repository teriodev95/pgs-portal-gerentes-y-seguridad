<script setup lang="ts">
import InfoIcon from '@/shared/components/icons/InfoIcon.vue'

interface Props {
  message: string
  visible: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    v-show="visible"
    class="bg-blue-100 border-2 rounded-2xl border-blue-700 p-4"
  >
    <h2 class="title flex items-center gap-1 !text-blue-800">
      <InfoIcon class="h-6 w-6" />
      Valida tu Identidad
    </h2>
    <p class="subtitle !leading-[1.15rem]">
      Para completar la validación facial y por voz, por favor utiliza tu cámara frontal y di la
      palabra clave: ({{ message }}) en voz alta mientras grabas el video.
    </p>
  </div>
</template>