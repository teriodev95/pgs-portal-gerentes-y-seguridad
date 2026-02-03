<script setup lang="ts">
import InfoIcon from '@/shared/components/icons/InfoIcon.vue'
import TextCT from '@/shared/components/ui/TextCT.vue';

interface Props {
  message: string
  visible: boolean
}

defineProps<Props>()
</script>

<template>
  <div
    v-show="visible"
    class="bg-blue-100 border-2 rounded-2xl border-blue-700 p-4 space-y-2"
  >
    <TextCT variant="secondary" class="flex items-center gap-2">
      <InfoIcon class="h-6 w-6" />
      Valida tu Identidad
    </TextCT>
    <TextCT>
      Para completar la validación facial y por voz, por favor utiliza tu cámara frontal y di la
      palabra clave: ({{ message }}) en voz alta mientras grabas el video.
    </TextCT>
  </div>
</template>