<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string
  labelClass?: string
  valueClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  labelClass: 'font-300 text-gray-400',
  valueClass: 'font-md-700 text-blue-800'
})

const parsedValue = computed(() => {
  try {
    const parsed = JSON.parse(props.value)
    if (typeof parsed === 'object' && parsed !== null) {
      // If the object has a single "prestamo" key, return its contents directly
      if (Object.keys(parsed).length === 1 && parsed.prestamo && typeof parsed.prestamo === 'object') {
        return parsed.prestamo
      }
      return parsed
    }
    return null
  } catch {
    return null
  }
})

const isJsonObject = computed(() => parsedValue.value !== null)

const getValueClasses = (value: any): string => {
  const baseClasses = props.valueClass

  if (typeof value === 'boolean') {
    return value
      ? `${baseClasses} !text-green-600`
      : `${baseClasses} !text-red-600`
  }

  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase()
    if (lowerValue === 'no apto') {
      return `${baseClasses} !text-red-600`
    }
    if (lowerValue === 'apto') {
      return `${baseClasses} !text-green-600`
    }
  }

  return baseClasses
}
</script>

<template>
  <div>
    <p :class="labelClass">{{ label }}</p>

    <!-- Display JSON object as key-value pairs -->
    <div v-if="isJsonObject" class="space-y-1">
      <div v-for="(val, key) in parsedValue" :key="key" class="flex justify-between gap-2">
        <span :class="`${labelClass} capitalize`">{{ key }}:</span>
        <span :class="getValueClasses(val)">
          {{ val }}
        </span>
      </div>
    </div>

    <!-- Display regular string value -->
    <p v-else :class="valueClass">{{ value }}</p>
  </div>
</template>