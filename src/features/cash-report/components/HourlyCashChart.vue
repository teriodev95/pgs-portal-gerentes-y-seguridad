<script setup lang="ts">
import { computed } from 'vue'
import { Clock3, TrendingUp } from 'lucide-vue-next'
import { formatCurrency, getCashLevel } from '../cash-report.utils'
import type { HourlyCashPoint, HourlyCashReport } from '../cash-report.types'

const props = defineProps<{
  report: HourlyCashReport
  selectedHour?: number | null
}>()

const emit = defineEmits<{ 'select-hour': [hour: number] }>()

const hours = computed(() => props.report.horas)

const maxTotal = computed(() => {
  const totals = hours.value.map((h) => h.totales.granTotal)
  const max = Math.max(...totals, props.report.resumen.pico?.granTotal ?? 0)
  return max > 0 ? max : 1
})

function formatCompactAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 10_000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`
  }
  return `$${amount}`
}

function hourLabel(hour: number | null) {
  if (hour == null) return '—'
  return `${String(hour).padStart(2, '0')}:00`
}

function barHeight(point: HourlyCashPoint): number {
  if (point.totales.granTotal <= 0) return 6
  const percentage = Math.round((point.totales.granTotal / maxTotal.value) * 100)
  return Math.max(8, Math.min(percentage, 100))
}

function isPeak(point: HourlyCashPoint): boolean {
  return point.hora === props.report.resumen.pico?.hora
}

function getBarColor(point: HourlyCashPoint): string {
  if (isPeak(point)) {
    return 'bg-blue-700 group-hover:bg-blue-800'
  }
  if (getCashLevel(point.totales.granTotal) === 'red') {
    return 'bg-red-600 group-hover:bg-red-700'
  }
  return 'bg-blue-400 group-hover:bg-blue-500'
}
</script>

<template>
  <section
    v-if="hours.length"
    class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5"
    aria-label="Gráfica de evolución horaria"
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="inline-flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <TrendingUp class="size-4" aria-hidden="true" />
        </span>
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
            Evolución horaria del efectivo
          </h3>
          <p class="text-[11px] text-slate-400">
            Total en campo por cada corte disponible
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 text-[11px] text-slate-500">
        <span class="inline-flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-blue-700" />
          Pico ({{ hourLabel(report.resumen.pico?.hora ?? null) }})
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-blue-400" />
          Snapshots
        </span>
      </div>
    </div>

    <!-- Chart container -->
    <div class="mt-4">
      <!-- El relleno de arriba era el hueco que necesitaba el distintivo cuando
           flotaba; ahora que va en flujo, ese espacio se lo quedan las barras.
           El de abajo se queda: ahí vive el rótulo de la hora. -->
      <div class="relative flex h-36 items-end gap-2 overflow-x-auto pb-6 pt-2 sm:justify-around">
        <!-- Guidelines -->
        <div class="pointer-events-none absolute inset-x-0 bottom-6 top-2 flex flex-col justify-between opacity-30">
          <div class="border-b border-dashed border-slate-300" />
          <div class="border-b border-dashed border-slate-300" />
          <div class="border-b border-dashed border-slate-300" />
        </div>

        <!-- Bars -->
        <div
          v-for="point in hours"
          :key="point.hora"
          class="group relative flex h-full min-w-[44px] flex-1 cursor-pointer flex-col items-center justify-end transition-transform"
          :title="`${hourLabel(point.hora)}: ${formatCurrency(point.totales.granTotal)}${isPeak(point) ? ' (Pico del día)' : ''}`"
          @click="emit('select-hour', point.hora)"
        >
          <!--
            Ranura del distintivo. Se reserva en todas las columnas aunque sólo
            una sea el pico: en flujo y con alto fijo, las demás no se corren y
            el distintivo deja de encimarse sobre la cifra, que es lo que hacía
            flotando en `absolute`.
          -->
          <span class="flex h-4 shrink-0 items-center">
            <span
              v-if="isPeak(point)"
              class="rounded-full bg-blue-700 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white shadow-2xs"
            >
              Pico
            </span>
          </span>

          <!-- Value on top of bar -->
          <span
            class="mb-1 shrink-0 text-[10px] font-bold transition-colors"
            :class="isPeak(point) ? 'text-blue-700' : 'text-slate-600'"
          >
            {{ formatCompactAmount(point.totales.granTotal) }}
          </span>

          <!-- Bar column. `flex-1` y no `h-full`: con el alto completo se comía
               el sitio de la cifra y del distintivo. -->
          <div class="relative flex w-full min-h-0 max-w-[28px] flex-1 items-end justify-center">
            <div
              class="w-full rounded-t-md transition-all duration-300"
              :class="getBarColor(point)"
              :style="{ height: `${barHeight(point)}%` }"
            />
          </div>

          <!-- Bottom hour label -->
          <span
            class="absolute -bottom-5 text-[11px] font-semibold transition-colors"
            :class="isPeak(point) ? 'text-slate-900 font-bold' : 'text-slate-500 group-hover:text-slate-900'"
          >
            {{ hourLabel(point.hora) }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
