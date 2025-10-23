<script setup lang="ts">
import { computed } from 'vue'
import { toCurrency } from '@/shared/utils';

interface Props {
  value: number
  quantity: number
  disabled?: boolean
}

interface Emits {
  (e: 'update:quantity', quantity: number): void
}

const $props = defineProps<Props>()
const $emit = defineEmits<Emits>()

const total = computed(() => $props.value * $props.quantity)

function handleQuantityChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const value = Number(input.value)

  if (!Number.isNaN(value) && value >= 0) {
    $emit('update:quantity', value)
  } else {
    $emit('update:quantity', 0)
    input.value = '0'
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <input
        type="number"
        min="0"
        :value="quantity"
        :disabled="disabled"
        @input="handleQuantityChange"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
        required
      />
      <span class="font-300 text-gray-400">x</span>
      <span class="font-300 text-gray-400">{{ value }}</span>
      <span class="font-300 text-gray-400">&#61;</span>
    </div>
    <span class="font-md-700 text-blue-800">
      {{ toCurrency(total) }}
    </span>
  </div>
</template>