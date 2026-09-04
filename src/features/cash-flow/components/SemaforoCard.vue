<script setup lang="ts">
import { computed } from 'vue'
import type { Cubos } from '../types/cashFlow.types'
import { useCashFlowFormatters } from '../composables/useCashFlowFormatters'

const props = defineProps<{ cubos: Cubos }>()
const { formatMoney } = useCashFlowFormatters()

// Cuadra cuando la diferencia entre entradas y ubicaciones es de centavos.
const cuadra = computed(() => Math.abs(props.cubos.sin_cuadrar) < 1)
</script>

<template>
  <section class="rounded-xl border border-gray-200 bg-white p-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Efectivo gerente</p>
        <p class="text-2xl font-bold text-gray-950">{{ formatMoney(cubos.con_gerente) }}</p>
      </div>
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Efectivo campo</p>
        <p class="text-2xl font-bold text-gray-950">{{ formatMoney(cubos.en_campo) }}</p>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
      <p class="text-sm text-gray-600">
        Total <span class="ml-1 text-base font-bold text-gray-950">{{ formatMoney(cubos.efectivo_a_entregar) }}</span>
      </p>
      <span
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
        :class="cuadra ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
      >
        <span class="size-2 rounded-full" :class="cuadra ? 'bg-emerald-500' : 'bg-rose-500'" />
        {{ cuadra ? 'Cuadra' : `Descuadre ${formatMoney(cubos.sin_cuadrar)}` }}
      </span>
    </div>
  </section>
</template>
