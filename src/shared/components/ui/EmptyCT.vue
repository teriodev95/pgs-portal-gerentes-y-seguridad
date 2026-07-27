<script setup lang="ts">
// Components
import BoxCloseOutline from '@/shared/components/icons/BoxCloseOutline.vue'

// Props
export interface Props {
  message?: string
  description?: string
  /** Variante para vacíos que conviven con contenido debajo (no ocupa la pantalla). */
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  message: 'No se encontraron resultados',
  description: '',
  compact: false
})
</script>

<template>
  <div
    class="flex items-center justify-center"
    :class="compact ? 'min-h-[9rem] p-4' : 'min-h-[32rem] p-8'"
  >
    <div class="text-center">
      <!-- Icon -->
      <div class="flex justify-center" :class="compact ? 'mb-3' : 'mb-6'">
        <div class="rounded-full bg-gray-100" :class="compact ? 'p-3' : 'p-6'">
          <BoxCloseOutline class="text-gray-400" :class="compact ? 'h-8 w-8' : 'h-20 w-20'" />
        </div>
      </div>

      <!-- Message -->
      <h2 class="mb-2 font-semibold text-gray-800" :class="compact ? 'text-lg' : 'text-2xl'">
        {{ message }}
      </h2>

      <!-- Description -->
      <p v-if="description" class="mx-auto max-w-md text-sm text-gray-500">
        {{ description }}
      </p>
    </div>
  </div>
</template>
