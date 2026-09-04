<script setup lang="ts">
import type { Barras, Segmento } from '../utils/segmentos'
import { useCashFlowFormatters } from '../composables/useCashFlowFormatters'

defineProps<{ barras: Barras }>()
const { formatMoney } = useCashFlowFormatters()

const ancho = (s: Segmento, total: number) => `${(s.monto / total) * 100}%`
</script>

<template>
  <section class="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
    <div v-for="lado in ([
      { titulo: 'Entradas', segmentos: barras.entradas, total: barras.totalEntradas },
      { titulo: 'Ubicación', segmentos: barras.ubicaciones, total: barras.totalUbicaciones },
    ] as const)" :key="lado.titulo">
      <div class="flex items-baseline justify-between">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{{ lado.titulo }}</p>
        <p class="text-sm font-bold text-gray-950">{{ formatMoney(lado.total) }}</p>
      </div>
      <div class="mt-1.5 flex h-3 w-full overflow-hidden rounded bg-gray-100">
        <span
          v-for="s in lado.segmentos"
          :key="s.clave"
          :class="s.color"
          :style="{ width: ancho(s, barras.total) }"
        />
      </div>
      <p class="mt-1.5 text-xs leading-5 text-gray-600">
        <template v-for="(s, i) in lado.segmentos" :key="s.clave">
          <span v-if="i > 0"> · </span>
          <span class="mr-1 inline-block size-2 rounded-sm align-middle" :class="s.color" />{{ s.etiqueta }}
          <span class="font-semibold text-gray-900">{{ formatMoney(s.monto) }}</span>
        </template>
      </p>
    </div>
  </section>
</template>
