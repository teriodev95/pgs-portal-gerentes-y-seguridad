<script setup lang="ts">
import TextCT from './ui/TextCT.vue';
import { cn } from '@/lib/utils';

 interface Props {
  title?: string;
  className?: string;
 }

const props = defineProps<Props>();

</script>

<template>
  <div :class="cn('space-y-4 rounded-lg border bg-white p-4', props.className)">
    <text-c-t as="h2" variant="title" v-if="title">
      {{ title }}
    </text-c-t>
    <slot></slot>
  </div>
</template>