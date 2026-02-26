<script setup lang="ts">
defineProps<{
  imageUrl: string
  isLoading: boolean
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-4">
    <!-- Loading State -->
    <template v-if="isLoading">
      <div class="flex flex-col items-center gap-5 py-8">
        <div class="flex items-center gap-1.5">
          <div class="loader-dot h-2.5 w-2.5 rounded-full bg-blue-500" style="animation-delay: 0ms" />
          <div class="loader-dot h-2.5 w-2.5 rounded-full bg-blue-500" style="animation-delay: 150ms" />
          <div class="loader-dot h-2.5 w-2.5 rounded-full bg-blue-500" style="animation-delay: 300ms" />
        </div>
        <div class="text-center space-y-1">
          <p class="text-sm font-medium text-slate-700">Generando reporte</p>
          <p class="text-xs text-slate-400">Esto puede tomar unos segundos</p>
        </div>
      </div>
    </template>

    <!-- Image Preview -->
    <template v-else-if="imageUrl">
      <div class="w-full overflow-hidden rounded-xl border border-slate-200">
        <img
          :src="imageUrl"
          alt="Reporte generado"
          class="w-full h-auto block"
        >
      </div>
    </template>
  </div>
</template>

<style scoped>
.loader-dot {
  animation: loader-bounce 1s ease-in-out infinite;
}

@keyframes loader-bounce {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
