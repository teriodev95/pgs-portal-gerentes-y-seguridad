<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { ref } from 'vue'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'
import type { IAgencyBasicInfo } from '@/interfaces'

defineProps<{
  agencies: IAgencyBasicInfo[]
  selectedAgency: string
}>()

const emit = defineEmits<{
  select: [agency: string]
}>()

const bottomSheetRef = ref<InstanceType<typeof VueBottomSheet>>()

function open(): void {
  bottomSheetRef.value?.open()
}

function close(): void {
  bottomSheetRef.value?.close()
}

function handleSelect(agency: string): void {
  emit('select', agency)
  close()
}

defineExpose({
  open,
  close
})
</script>

<template>
  <vue-bottom-sheet ref="bottomSheetRef" :max-width="960" :max-height="720">
    <div class="space-y-5 px-5 pb-8 pt-4">
      <div class="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />

      <div class="space-y-1">
        <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Agencia</p>
        <h2 class="text-xl font-semibold tracking-[-0.02em] text-slate-900">Filtrar solicitudes</h2>
        <p class="text-sm leading-relaxed text-slate-600">
          Selecciona una agencia de la gerencia activa para acotar la revisión.
        </p>
      </div>

      <div class="max-h-[52vh] overflow-y-auto pr-1">
        <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition"
          :class="selectedAgency === 'all'
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
          @click="handleSelect('all')"
        >
          Todas
        </button>
        <button
          v-for="agency in agencies"
          :key="agency.agencia"
          type="button"
          class="inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition"
          :class="selectedAgency === agency.agencia
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
          @click="handleSelect(agency.agencia)"
        >
          {{ agency.agencia }}
        </button>
        </div>
      </div>
    </div>
  </vue-bottom-sheet>
</template>
