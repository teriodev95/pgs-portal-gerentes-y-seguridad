<script setup lang="ts">
export interface Props {
  progress: number
  label?: string
}
const $props = defineProps<Props>()
</script>

<template>
  <div
    class="relative h-10 w-full rounded-2xl border border-white bg-blue-100 text-center text-white"
  >
    <div
      :style="`width: ${$props.progress}%;`"
      class="absolute left-0 top-0 h-full rounded-2xl bg-blue-700"
    ></div>
    <div
      class="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center text-center font-semibold text-blue-900"
      :style="`${progress > 50 ? 'color:white' : ''}`"
    >
      {{ progress }}%
    </div>
  </div>
</template>
