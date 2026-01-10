<script setup lang="ts">
interface Props {
  variante?: 'primary' | 'secondary' | 'title' | 'paragraph'
}

defineProps<Props>()
</script>
<template>
  <p :class="{
    'primary-text': variante === 'primary',
    'secondary-text': variante === 'secondary',
    'title-text': variante === 'title',
    'paragraph-text': variante === 'paragraph'
  }">
    <slot />
  </p>
</template>
