<script setup lang="ts">
import type { ReportType } from '../types'
import { FileBarChart, Building2 } from 'lucide-vue-next'

const props = defineProps<{
  isGenerating?: boolean
  isDaySelected?: boolean
}>()

const emit = defineEmits<{
  'report:generate': [type: ReportType]
}>()

function handleGenerateReport(type: ReportType): void {
  emit('report:generate', type)
}

const isDisabled = () => props.isGenerating || !props.isDaySelected
</script>

<template>
  <div class="space-y-2">
    <span class="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 pl-1">
      Tipo de reporte
    </span>

    <div class="grid grid-cols-2 gap-2.5">
      <button
        :disabled="isDisabled()"
        @click="handleGenerateReport('gerencia')"
        class="group flex flex-col items-center gap-2.5 rounded-2xl border p-5 transition-all duration-200 active:scale-[0.97]"
        :class="isDisabled()
          ? 'border-slate-100 bg-slate-50 cursor-not-allowed'
          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm'"
      >
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200"
          :class="isDisabled()
            ? 'bg-slate-100 text-slate-300'
            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'"
        >
          <FileBarChart :size="22" :stroke-width="1.75" />
        </div>
        <span
          class="text-sm font-semibold transition-colors duration-200"
          :class="isDisabled() ? 'text-slate-300' : 'text-slate-700'"
        >
          Gerencia
        </span>
      </button>

      <button
        :disabled="isDisabled()"
        @click="handleGenerateReport('agencia')"
        class="group flex flex-col items-center gap-2.5 rounded-2xl border p-5 transition-all duration-200 active:scale-[0.97]"
        :class="isDisabled()
          ? 'border-slate-100 bg-slate-50 cursor-not-allowed'
          : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/50 hover:shadow-sm'"
      >
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200"
          :class="isDisabled()
            ? 'bg-slate-100 text-slate-300'
            : 'bg-violet-50 text-violet-600 group-hover:bg-violet-100'"
        >
          <Building2 :size="22" :stroke-width="1.75" />
        </div>
        <span
          class="text-sm font-semibold transition-colors duration-200"
          :class="isDisabled() ? 'text-slate-300' : 'text-slate-700'"
        >
          Agencia
        </span>
      </button>
    </div>

    <p
      v-if="!isDaySelected"
      class="text-center text-xs text-slate-400 pt-1"
    >
      Selecciona un día para generar el reporte
    </p>
  </div>
</template>
