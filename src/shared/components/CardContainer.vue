<script setup lang="ts">
import TextCT from './ui/TextCT.vue';

 interface Props {
  title?: string;
  className?: string;
 }

defineProps<Props>();

</script>

<template>
  <div class="space-y-4 rounded-lg border bg-white p-4" :class="className">
    <text-c-t as="h2" variant="title" v-if="title">
      {{ title }}
    </text-c-t>
    <slot></slot>
  </div>
</template>