<script setup lang="ts">
interface Props {
  showHeatMap: boolean
}

interface Emits {
  (e: 'back'): void
  (e: 'toggleHeat'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <!-- Back button -->
  <div
    @click="emit('back')"
    class="absolute right-3 top-2 z-[810] cursor-pointer border border-black bg-white p-2"
  >
    <slot name="back-icon" />
  </div>

  <!-- Heat map toggle button -->
  <div
    @click="emit('toggleHeat')"
    :class="[
      'absolute right-3 top-20 z-[810] cursor-pointer border bg-white p-2',
      showHeatMap ? 'border-red-600 text-red-600' : 'border-black'
    ]"
  >
    <slot name="map-icon" />
  </div>
</template>