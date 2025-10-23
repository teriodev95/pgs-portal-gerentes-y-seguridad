<script setup lang="ts">
import { toCurrency } from '@/shared/utils';

interface Props {
  total: number
}

defineProps<Props>()
</script>

<template>
  <div class="w-full text-center space-y-2">
    <p class="font-semibold text-lg text-gray-400">Total</p>
    <p class="font-bold text-2xl text-blue-800">{{ toCurrency(total) }}</p>
  </div>
</template>