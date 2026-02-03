<script setup lang="ts">
interface Props {
  title: string
  msg: string
  type: 'success' | 'error'
}

import CheckCircleIcon from '@/shared/components/icons/CheckCircleIcon.vue'
import TextCT from './ui/TextCT.vue';

defineProps<Props>()
</script>
<template>
  <div
    class="rounded-2xl p-8 !text-white text-center space-y-4"
    :class="{
      'bg-red-500': type === 'error',
      'bg-green-500': type === 'success'
    }"
  >
    <CheckCircleIcon class="h-12 w-12 mx-auto" />

    <TextCT variant="title" class="!text-white">{{ title }}</TextCT>
    <TextCT >
      <span v-html="msg"></span>
    </TextCT>
  </div>
</template>
