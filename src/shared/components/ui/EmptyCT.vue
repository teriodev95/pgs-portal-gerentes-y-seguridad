<script setup lang="ts">
// Components
import BoxCloseOutline from '@/shared/components/icons/BoxCloseOutline.vue'

// Props
export interface Props {
  message?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  message: 'No se encontraron resultados',
  description: ''
})
</script>

<template>
  <div class="flex min-h-[32rem] items-center justify-center p-8">
    <div class="text-center">
      <!-- Icon -->
      <div class="mb-6 flex justify-center">
        <div class="rounded-full bg-gray-100 p-6">
          <BoxCloseOutline class="h-20 w-20 text-gray-400" />
        </div>
      </div>

      <!-- Message -->
      <h2 class="mb-2 text-2xl font-semibold text-gray-800">
        {{ message }}
      </h2>

      <!-- Description -->
      <p v-if="description" class="mx-auto max-w-md text-sm text-gray-500">
        {{ description }}
      </p>
    </div>
  </div>
</template>
