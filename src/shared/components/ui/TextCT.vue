<script setup lang="ts">
interface Props {
  variante?: 'primary' | 'secondary'
}

defineProps<Props>()
</script>
<template>
  <p :class="{
    'primary-text': variante === 'primary',
    'secondary-text': variante === 'secondary'
  }">
    <slot />
  </p>
</template>
