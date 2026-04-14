<script setup lang="ts">
interface Props {
  label?: string
  value: string | number
  variant?: 'red' | 'blue' | 'yellow' | 'green' | 'gray' | 'orange'
  showLabel?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  variant: 'gray',
  showLabel: true
})

const baseClasses = 'font-semibold px-2 py-1 rounded-full'

const variantClasses = {
  red: 'text-red-700 bg-red-100',
  blue: 'text-blue-700 bg-blue-100',
  yellow: 'text-yellow-700 bg-yellow-100',
  green: 'text-green-700 bg-green-100',
  gray: 'text-gray-700 bg-gray-100',
  orange: 'text-orange-700 bg-orange-100'
}
</script>

<template>
  <div class="flex items-center gap-2">
    <p v-if="showLabel && label" class="text-sm text-gray-500">{{ label }}:</p>
    <span :class="[baseClasses, variantClasses[variant]]">
      {{ value }}
    </span>
  </div>
</template>
