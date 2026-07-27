<script setup lang="ts">
import { ref } from 'vue'
import { Link2 } from 'lucide-vue-next'

defineProps<{ busy?: boolean }>()

const emit = defineEmits<{
  (e: 'share'): void
  (e: 'copy'): void
  (e: 'revoke'): void
}>()

// Revocar rompe el enlace que ya circula en el grupo: siempre confirma.
const confirming = ref(false)

function revoke() {
  confirming.value = false
  emit('revoke')
}
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-3">
    <div class="flex items-center gap-2">
      <Link2 class="size-4 shrink-0 text-gray-600" :stroke-width="2" />
      <span class="flex-1 text-sm text-gray-900">Enlace activo</span>

      <div class="flex items-center gap-3 text-sm font-medium text-blue-700">
        <button type="button" :disabled="busy" @click="emit('share')">Compartir</button>
        <button type="button" :disabled="busy" @click="emit('copy')">Copiar</button>
        <button type="button" class="text-red-700" :disabled="busy" @click="confirming = true">
          Revocar
        </button>
      </div>
    </div>

    <div v-if="confirming" class="mt-3 border-t border-gray-100 pt-3">
      <p class="text-sm text-gray-900">
        Al revocar, el enlace que ya compartiste dejará de abrir tu agenda.
      </p>
      <div class="mt-2 flex gap-3 text-sm font-medium">
        <button type="button" class="text-red-700" @click="revoke">Sí, revocar</button>
        <button type="button" class="text-gray-700" @click="confirming = false">Cancelar</button>
      </div>
    </div>
  </div>
</template>
