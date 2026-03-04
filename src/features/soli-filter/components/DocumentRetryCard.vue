<script setup lang="ts">
import { AlertTriangle, RefreshCw } from 'lucide-vue-next'
import type { DocumentoRepetir } from '../types/soliFilter.types'

defineProps<{
  documento: DocumentoRepetir
  showRetryButton?: boolean
}>()

defineEmits<{
  'retry': [campo: string]
}>()
</script>

<template>
  <div class="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
    <div class="flex gap-3">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
        <AlertTriangle :size="18" :stroke-width="2" class="text-amber-600" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-amber-800">{{ documento.documento }}</p>
        <p class="mt-1 text-xs text-amber-700/80">
          <span class="font-medium">Causa:</span> {{ documento.causa }}
        </p>
        <p class="mt-0.5 text-xs text-amber-700/80">
          <span class="font-medium">Solución:</span> {{ documento.solucion }}
        </p>
        <button
          v-if="showRetryButton"
          type="button"
          class="mt-2.5 flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
          @click="$emit('retry', documento.campo)"
        >
          <RefreshCw :size="12" :stroke-width="2.5" />
          Tomar foto de nuevo
        </button>
      </div>
    </div>
  </div>
</template>
