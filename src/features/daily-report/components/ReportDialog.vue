<script setup lang="ts">
import type { ReportType } from '../types'
import { Share2, X, Loader } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

defineProps<{
  isOpen: boolean
  reportType: ReportType
  isLoading: boolean
  imageUrl: string
  isSharing?: boolean
}>()

const emit = defineEmits<{
  'dialog:close': []
  'report:share': []
}>()

function handleClose(): void {
  emit('dialog:close')
}

function handleShare(): void {
  emit('report:share')
}

const reportLabel = (type: ReportType) => type === 'gerencia' ? 'Gerencia' : 'Agencia'
</script>

<template>
  <Dialog
    :open="isOpen"
    @update:open="(value) => value ? null : (!isLoading && handleClose())"
  >
    <DialogContent
      class="rounded-2xl max-w-sm w-[calc(100%-2rem)] mx-auto p-0 overflow-hidden gap-0 border-0 shadow-xl"
      :disable-outside-pointer-events="isLoading"
    >
      <!-- ========== LOADING STATE ========== -->
      <template v-if="isLoading">
        <div class="flex flex-col items-center px-8 py-12">
          <!-- Animated icon -->
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 mb-6">
            <Loader :size="28" :stroke-width="2" class="animate-spin text-blue-500" />
          </div>

          <!-- Text -->
          <DialogHeader class="text-center space-y-2 p-0">
            <DialogTitle class="text-lg font-semibold text-slate-800">
              Generando reporte
            </DialogTitle>
            <DialogDescription class="text-sm text-slate-400 leading-relaxed max-w-[240px] mx-auto">
              Mantén esta ventana abierta, tardará menos de un minuto.
            </DialogDescription>
          </DialogHeader>

          <!-- Progress bar -->
          <div class="w-full mt-8 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full bg-blue-500 progress-bar" />
          </div>
        </div>
      </template>

      <!-- ========== RESULT STATE ========== -->
      <template v-else-if="imageUrl">
        <!-- Header -->
        <div class="px-6 pt-6 pb-4">
          <DialogHeader class="p-0">
            <DialogTitle class="text-base font-semibold text-slate-800">
              Reporte {{ reportLabel(reportType) }}
            </DialogTitle>
            <DialogDescription class="text-xs text-slate-400 mt-0.5">
              Listo para compartir
            </DialogDescription>
          </DialogHeader>
        </div>

        <!-- Image -->
        <div class="px-6">
          <div class="overflow-hidden rounded-xl border border-slate-100">
            <img
              :src="imageUrl"
              alt="Reporte generado"
              class="w-full h-auto block"
            >
          </div>
        </div>

        <!-- Actions -->
        <div class="px-6 pt-4 pb-6">
          <div class="flex gap-2.5">
            <button
              :disabled="isSharing"
              @click="handleClose"
              class="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-500 transition-all duration-150 hover:bg-slate-50 active:scale-[0.97]"
            >
              <X :size="15" :stroke-width="2.5" />
              Cerrar
            </button>
            <button
              :disabled="isSharing"
              @click="handleShare"
              class="flex h-11 flex-[2] items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-slate-800 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 v-if="!isSharing" :size="15" :stroke-width="2.5" />
              <div v-else class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {{ isSharing ? 'Enviando...' : 'Compartir' }}
            </button>
          </div>
        </div>
      </template>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.progress-bar {
  animation: progress-indeterminate 1.8s ease-in-out infinite;
}

@keyframes progress-indeterminate {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 60%;
    margin-left: 20%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}
</style>
