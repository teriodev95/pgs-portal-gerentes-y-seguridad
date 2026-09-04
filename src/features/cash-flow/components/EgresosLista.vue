<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import type { Egresos, PartidaEgreso, RubroEgreso } from '../types/cashFlow.types'
import { useCashFlowFormatters } from '../composables/useCashFlowFormatters'

const props = defineProps<{ egresos: Egresos }>()
const { formatMoney } = useCashFlowFormatters()

interface Fila {
  etiqueta: string
  rubros: RubroEgreso[]
  monto: number
}

// Comisiones de cobranza y de ventas van juntas: en el reporte son una sola línea.
const filas = computed<Fila[]>(() => [
  { etiqueta: 'Ventas', rubros: ['ventas'], monto: props.egresos.ventas },
  { etiqueta: 'Gastos', rubros: ['gastos'], monto: props.egresos.gastos },
  {
    etiqueta: 'Comisiones',
    rubros: ['comisiones_cobranza', 'comisiones_ventas'],
    monto: props.egresos.comisiones_cobranza + props.egresos.comisiones_ventas,
  },
  { etiqueta: 'Bonos', rubros: ['bonos'], monto: props.egresos.bonos },
  { etiqueta: 'Incidentes', rubros: ['incidentes'], monto: props.egresos.incidentes },
])

const abierta = ref<string | null>(null)

function partidasDe(fila: Fila): PartidaEgreso[] {
  return props.egresos.partidas.filter((p) => fila.rubros.includes(p.rubro))
}

function alternar(fila: Fila): void {
  if (fila.monto === 0) return
  abierta.value = abierta.value === fila.etiqueta ? null : fila.etiqueta
}
</script>

<template>
  <section class="rounded-xl border border-gray-200 bg-white">
    <div class="flex items-baseline justify-between px-4 pt-4">
      <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Egresos</p>
      <p class="text-sm font-bold text-gray-950">{{ formatMoney(egresos.total) }}</p>
    </div>

    <ul class="mt-2 divide-y divide-gray-100">
      <li v-for="fila in filas" :key="fila.etiqueta">
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-2.5 text-left"
          :class="fila.monto === 0 ? 'text-gray-400' : 'text-gray-900'"
          @click="alternar(fila)"
        >
          <span class="text-sm">{{ fila.etiqueta }}</span>
          <span class="flex items-center gap-2 text-sm font-semibold">
            {{ formatMoney(fila.monto) }}
            <ChevronRight
              class="size-4 text-gray-400 transition-transform"
              :class="[fila.monto === 0 ? 'invisible' : '', abierta === fila.etiqueta ? 'rotate-90' : '']"
              :stroke-width="2"
            />
          </span>
        </button>

        <ul v-if="abierta === fila.etiqueta" class="bg-gray-50 px-4 pb-2">
          <li
            v-for="(p, i) in partidasDe(fila)"
            :key="p.registro_id ?? i"
            class="flex items-baseline justify-between gap-3 py-1.5 text-xs"
          >
            <span class="min-w-0 truncate text-gray-600">{{ p.concepto }}</span>
            <span class="shrink-0 font-semibold text-gray-900">{{ formatMoney(p.monto) }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>
