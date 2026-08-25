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
  <!--
    La barra queda fija y el contenido corre por debajo. Sin una linea que las
    separe, blanco sobre blanco, la fila que va pasando se ve cortada a la mitad
    y parece un error de dibujo en vez de scroll. El borde -y la sombra corta-
    dicen que hay una superficie encima de otra.
  -->
  <div class="sticky top-0 z-20 w-full border-b border-slate-200/80 bg-white p-2 pb-3 shadow-sm">
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

      <div class="flex min-w-0 flex-col opacity-95">
        <div class="flex items-center gap-2">
          <h1 class="flex-shrink-0 text-lg font-semibold text-gray-900">
            {{ title }}
          </h1>
          <!-- Ranura para un estado junto al titulo. Es un slot y no una prop
               con forma de cierre porque este navbar lo usan muchas pantallas;
               cada una sabe que estado tiene sentido mostrar. -->
          <slot name="estado" />
        </div>

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
