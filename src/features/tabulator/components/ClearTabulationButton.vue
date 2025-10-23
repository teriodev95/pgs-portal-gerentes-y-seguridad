<script setup lang="ts">
import TrashIcon from '@/shared/components/icons/TrashIcon.vue'

interface Emits {
  (e: 'clear'): void
}

defineEmits<Emits>()
</script>

<template>
  <button 
    @click="$emit('clear')" 
    class="btn btn-primary-outline"
    type="button"
    title="Limpiar tabulación"
  >
    <TrashIcon class="h-5 w-5" />
  </button>
</template>