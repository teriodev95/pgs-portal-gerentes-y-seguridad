<script setup lang="ts">
import TextCT from './TextCT.vue';

interface Props {
  label: string
  value: string | number
  color?: 'blue' | 'yellow' | 'green' | 'gray'
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col items-start justify-between p-4 border border-blue-200 rounded-lg bg-blue-100">
    <TextCT variant="primary">{{ label }}</TextCT>
    <TextCT variant="secondary">{{ value }}</TextCT>
  </div>
</template>
