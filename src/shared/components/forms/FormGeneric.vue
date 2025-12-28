<script setup lang="ts">
const emit = defineEmits<{
  submit: []
}>()

const handleSubmit = () => {
  emit('submit')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-2">
    <slot></slot>
  </form>
</template>