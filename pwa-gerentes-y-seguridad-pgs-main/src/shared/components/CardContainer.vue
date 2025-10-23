<script setup lang="ts">
 interface Props {
  title?: string;
  className?: string;
 }

defineProps<Props>();

</script>

<template>
  <div class="space-y-4 rounded-lg border bg-white p-4" :class="className">
    <h2 v-if="title" class="title">{{ title }}</h2>
    <slot></slot>
  </div>
</template>