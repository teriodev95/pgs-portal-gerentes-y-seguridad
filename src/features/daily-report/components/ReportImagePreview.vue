<script setup lang="ts">
defineProps<{
  imageUrl: string
  isLoading: boolean
}>()
</script>

<template>
  <div class="flex flex-col items-center space-y-4">
    <template v-if="isLoading">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </template>

    <template v-else-if="!isLoading && imageUrl">
      <img
        :src="imageUrl"
        alt="Reporte generado"
        class="max-w-full h-auto rounded-lg shadow-md"
      >
    </template>
  </div>
</template>