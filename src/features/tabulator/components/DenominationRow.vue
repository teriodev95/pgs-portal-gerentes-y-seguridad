<script setup lang="ts">
import { computed } from 'vue'
import { toCurrency } from '@/shared/utils';
import TextCT from '@/shared/components/ui/TextCT.vue';

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
      <TextCT as="span" variant="tertiary">x</TextCT>
      <TextCT as="span" variant="tertiary">{{ value }}</TextCT>
      <TextCT as="span" variant="tertiary">&#61;</TextCT>
    </div>
    <TextCT as="span" variant="secondary">
      {{ toCurrency(total) }}
    </TextCT>
  </div>
</template>