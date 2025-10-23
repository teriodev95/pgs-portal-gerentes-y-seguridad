<script lang="ts" setup>
import { computed } from 'vue'
import InfoIcon from './icons/InfoIcon.vue'

interface Props {
  label: string
  value: string | number
  valueClass?: string
  variant?: 'default' | 'yellow' | 'green' | 'highlight'
  size?: 'sm' | 'md'
  notice?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md'
})

const VARIANT_CLASSES = {
  yellow: 'text-yellow-400',
  green: 'text-green-600',
  highlight: 'text-yellow-500 text-2xl',
  default: 'text-blue-800'
} as const

/**
 * Computed property that returns the base property class based on size
 */
const getBasePropertyClass = computed(() => {
  return props.size === 'sm' ? 'property-value-thin' : 'property-value'
})

/**
 * Computed property that returns the complete CSS class combining base and variant styles
 */
const getValueClass = computed(() => {
  if (props.valueClass) return props.valueClass

  const baseClass = getBasePropertyClass.value
  const variantClass = VARIANT_CLASSES[props.variant]

  return `${baseClass} ${variantClass}`
})
</script>

<template>
  <div class="flex justify-between gap-4">
    <div v-if="props.label">
      <p class="font-light text-gray-400">
        {{ props.label }}
      </p>
      <p v-if="props.notice" class="font-sm-700 text-gray-400 text-sm mt-1 flex items-center gap-2">
        <InfoIcon class="h-4 w-4" /> {{ props.notice }}
      </p>
    </div>
    <p :class="getValueClass">
      {{ props.value }}
    </p>
  </div>
</template>