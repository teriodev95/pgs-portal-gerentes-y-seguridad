<script setup lang="ts">
import TextCT from '@/shared/components/ui/TextCT.vue';
import { toCurrency } from '@/shared/utils';

interface Props {
  total: number
}

defineProps<Props>()
</script>

<template>
  <div class="w-full text-center space-y-2">
    <TextCT variant="title">Total</TextCT>
    <p class="font-bold text-2xl text-blue-800">{{ toCurrency(total) }}</p>
  </div>
</template>