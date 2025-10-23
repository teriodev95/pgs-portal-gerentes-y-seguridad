<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="space-y-2">
    <h2 class="title">{{ title }}</h2>
    <p class="subtitle">
      {{ subtitle }}
    </p>
  </div>
</template>
