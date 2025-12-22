<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  text: string
}

defineProps<Props>()

const copied = ref(false)

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Error al copiar:', err)
  }
}
</script>

<template>
  <button
    @click="copyToClipboard(text)"
    class="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
    type="button"
    :title="copied ? 'Copiado!' : 'Copiar error'"
  >
    <svg v-if="!copied" class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
    <svg v-else class="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span>{{ copied ? 'Copiado!' : 'Copiar' }}</span>
  </button>
</template>