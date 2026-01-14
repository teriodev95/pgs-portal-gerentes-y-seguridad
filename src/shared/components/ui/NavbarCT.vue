<script setup lang="ts">
import { computed } from 'vue'
import { getDateTime } from '@/shared/utils'

// Components
import ArrowLeftIcon from '@/shared/components/icons/ArrowLeftIcon.vue'

// Emit - Props
export interface Emit {
  (e: 'back'): void
}

export interface Props {
  title: string
  subtitles?: string[]
  showBackButton?: boolean
}

defineEmits<Emit>()
const props = defineProps<Props>()

// Computed
const displaySubtitles = computed(() => {
  // Si se proporcionan subtitles, usarlos; sino, mostrar la fecha actual
  return props.subtitles && props.subtitles.length > 0
    ? props.subtitles
    : [getDateTime()]
})
</script>

<template>
  <div class="sticky top-0 z-20 w-full bg-white p-2">
    <nav class="flex items-center gap-3 px-4 py-2">
      <button
        v-if="showBackButton"
        type="button"
        class="h-10 w-10 cursor-pointer rounded-full bg-blue-700 p-2 opacity-95 shadow-md transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Volver atrás"
        @click="$emit('back')"
      >
        <ArrowLeftIcon class="text-white" />
      </button>

      <div class="flex flex-col opacity-95">
        <h1 class="text-lg font-semibold text-gray-900">
          {{ title }}
        </h1>

        <p
          v-for="(text, index) in displaySubtitles"
          :key="index"
          class="text-sm text-gray-500"
        >
          {{ text }}
        </p>
      </div>
    </nav>
  </div>
</template>
