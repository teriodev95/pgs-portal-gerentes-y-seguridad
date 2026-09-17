<script setup lang="ts">
/**
 * Paso 2: elegir el desembolso. Cada tarjeta es el credito completo, tocable.
 * El buscador aparece solo cuando la lista es larga para no cargar la pantalla.
 */
import { computed, ref } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { Disbursement } from '../types'

import AngleRight from '@/shared/components/icons/AngleRight.vue'
import SearchIcon from '@/shared/components/icons/SearchIcon.vue'
import BankNotesIcon from '@/shared/components/icons/BankNotesIcon.vue'

interface Props {
  disbursements: Disbursement[]
}

const props = defineProps<Props>()

interface Emits {
  (event: 'select', disbursement: Disbursement): void
}

const emit = defineEmits<Emits>()

const search = ref('')

const SEARCH_THRESHOLD = 6
const showSearch = computed(() => props.disbursements.length > SEARCH_THRESHOLD)

const plain = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const filtered = computed(() => {
  const query = plain(search.value).trim()
  if (!query) return props.disbursements
  return props.disbursements.filter((item) => plain(item.nombreCliente).includes(query))
})
</script>

<template>
  <div class="space-y-3">
    <!-- Buscador solo con lista larga -->
    <div v-if="showSearch" class="relative">
      <SearchIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="search"
        type="search"
        placeholder="Buscar por nombre del cliente"
        aria-label="Buscar desembolso por nombre"
        class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
      />
    </div>

    <!-- Lista de desembolsos -->
    <button
      v-for="item in filtered"
      :key="item.prestamoId"
      type="button"
      class="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-all hover:border-blue-400 hover:bg-blue-50/40 active:scale-[0.99]"
      @click="emit('select', item)"
    >
      <span class="min-w-0 flex-1 space-y-1.5">
        <span class="block truncate font-semibold capitalize text-slate-900">
          {{ item.nombreCliente.toLowerCase() }}
        </span>
        <span class="flex flex-wrap items-center gap-1.5 text-xs">
          <span class="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{{ item.agencia }}</span>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{{ item.tipo }}</span>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{{ item.nivel }}</span>
          <span class="text-slate-400">{{ item.plazo }} semanas</span>
        </span>
      </span>

      <span class="shrink-0 text-right">
        <span class="block font-bold tabular-nums text-slate-900">{{ toCurrency(item.monto) }}</span>
        <span class="mt-0.5 block text-xs text-slate-400">1er pago {{ toCurrency(item.primerPago) }}</span>
      </span>
      <AngleRight class="size-5 shrink-0 text-slate-400" />
    </button>

    <!-- Sin coincidencias de la búsqueda -->
    <p v-if="filtered.length === 0 && search" class="py-8 text-center text-sm text-slate-500">
      Ningún desembolso se llama “{{ search.trim() }}”.
    </p>

    <!-- Lista vacía -->
    <div v-else-if="filtered.length === 0" class="space-y-2 py-8 text-center">
      <BankNotesIcon class="mx-auto size-8 text-slate-300" />
      <p class="text-sm text-slate-500">Todos los desembolsos de la semana ya tienen venta.</p>
    </div>
  </div>
</template>
