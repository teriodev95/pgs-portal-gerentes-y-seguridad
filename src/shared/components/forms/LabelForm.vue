<script setup lang="ts">
import { computed } from 'vue';


interface Props {
  size?: 'xs' | 'sm' | 'lg';
  for: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm'
});

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm font-medium',
    lg: 'text-lg'
  };
  return sizes[props.size];
});
</script>

<template>
  <label :for="props.for" class="block text-gray-900 dark:text-white" :class="sizeClasses">
    <slot></slot>
  </label>
</template>