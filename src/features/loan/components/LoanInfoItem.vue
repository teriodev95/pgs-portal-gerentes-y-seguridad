<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  highlight?: boolean
  rightAligned?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  highlight: false,
  rightAligned: false
})
</script>

<template>
  <li class="flex justify-between gap-10">
    <div class="font-300 text-gray-400">{{ label }}</div>
    <div 
      :class="[
        'font-md-700 text-blue-800',
        rightAligned ? 'text-right' : ''
      ]"
      v-html="value"
    />
  </li>
</template>