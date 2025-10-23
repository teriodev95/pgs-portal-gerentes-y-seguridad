<script setup lang="ts">
interface Props {
  title: string
  msg: string
  type: 'success' | 'error'
}

import CheckCircleIcon from '@/shared/components/icons/CheckCircleIcon.vue'

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

    <h2 class="title !text-white">{{ title }}</h2>
    <p class="subtitle" v-html="msg"></p>
  </div>
</template>
