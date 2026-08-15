<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDownRight, ArrowUpRight, ChevronDown, Clock3, Smartphone } from 'lucide-vue-next'
import { formatPhone } from '@/shared/utils/phone'
import CashAmountCell from './CashAmountCell.vue'
import { formatCurrency, getCashLevel } from '../cash-report.utils'
import type {
  CashContactContext,
  HourlyCashPoint,
  HourlyCashReport,
  HourlyManagementCash
} from '../cash-report.types'

const props = defineProps<{ report: HourlyCashReport }>()
const emit = defineEmits<{ contact: [context: CashContactContext] }>()

const hoursNewestFirst = computed(() => [...props.report.horas].reverse())

function hourLabel(hour: number | null) {
  if (hour == null) return '—'
  return `${String(hour).padStart(2, '0')}:00`
}

function alertCount(point: HourlyCashPoint) {
  return point.gerencias.filter((management) =>
    [
      management.efectivo.conGerente,
      management.efectivo.conAgentes,
      ...management.agencias.map((agency) => agency.efectivoEnCampo)
    ].some((amount) => getCashLevel(amount) === 'red')
  ).length
}

function contact(management: HourlyManagementCash, concept: string, amount: number) {
  emit('contact', {
    gerencia: management.gerencia,
    responsable: management.responsable,
    concepto: concept,
    monto: amount
  })
}

function isPeak(point: HourlyCashPoint) {
  return point.hora === props.report.resumen.pico?.hora
}
</script>

<template>
  <section class="grid grid-cols-2 border-b border-slate-200 bg-slate-950 text-white" aria-label="Resumen de la evolución de hoy">
    <div class="px-4 py-4 sm:px-6">
      <span class="block text-xs text-slate-300">Pico de hoy</span>
      <strong class="mt-1 block text-lg sm:text-xl">{{ formatCurrency(report.resumen.pico?.granTotal ?? null) }}</strong>
      <span class="mt-1 block text-xs text-slate-300">{{ hourLabel(report.resumen.pico?.hora ?? null) }}</span>
    </div>
    <div class="border-l border-slate-700 px-4 py-4 sm:px-6">
      <span class="block text-xs text-slate-300">Última snapshot</span>
      <strong class="mt-1 block text-lg sm:text-xl">{{ hourLabel(report.resumen.ultimaHora) }}</strong>
      <span class="mt-1 block text-xs text-slate-300">{{ report.resumen.horasDisponibles }} horas registradas</span>
    </div>
  </section>

  <section class="border-b border-slate-200 bg-blue-50 px-4 py-4 text-sm text-blue-950 sm:px-6">
    <p class="font-semibold">Lo que pasó temprano permanece visible.</p>
    <p class="mt-1 text-blue-900">Cada bloque compara contra la snapshot anterior disponible. Las horas ausentes no se estiman.</p>
  </section>

  <div v-if="hoursNewestFirst.length" class="divide-y divide-slate-200">
    <details
      v-for="point in hoursNewestFirst"
      :key="point.hora"
      class="group bg-white"
      :open="point.hora === report.resumen.ultimaHora || isPeak(point)"
    >
      <summary class="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-700 sm:px-6">
        <div class="flex items-start gap-3">
          <span class="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800">
            <Clock3 class="size-4" aria-hidden="true" />
          </span>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <strong class="text-base text-slate-950">{{ hourLabel(point.hora) }}</strong>
              <span v-if="isPeak(point)" class="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">Pico del día</span>
              <span v-if="alertCount(point)" class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                {{ alertCount(point) }} {{ alertCount(point) === 1 ? 'gerencia en rojo' : 'gerencias en rojo' }}
              </span>
            </div>
            <p v-if="point.comparacion.cambioDesdeAnterior != null" class="mt-1 inline-flex items-center gap-1 text-xs font-medium" :class="point.comparacion.cambioDesdeAnterior <= 0 ? 'text-emerald-700' : 'text-red-700'">
              <ArrowDownRight v-if="point.comparacion.cambioDesdeAnterior <= 0" class="size-3.5" aria-hidden="true" />
              <ArrowUpRight v-else class="size-3.5" aria-hidden="true" />
              {{ point.comparacion.cambioDesdeAnterior <= 0 ? 'Bajó' : 'Subió' }}
              {{ formatCurrency(Math.abs(point.comparacion.cambioDesdeAnterior)) }} desde {{ hourLabel(point.comparacion.horaAnterior) }}
            </p>
            <p v-else class="mt-1 text-xs text-slate-500">Primera snapshot disponible</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-right">
          <div>
            <span class="block text-xs text-slate-500">Total</span>
            <strong class="text-base text-slate-950 sm:text-lg">{{ formatCurrency(point.totales.granTotal) }}</strong>
          </div>
          <ChevronDown class="size-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" aria-hidden="true" />
        </div>
      </summary>

      <div class="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
        <section v-for="management in point.gerencias" :key="management.gerencia" class="border-b border-slate-200 py-4 first:pt-0 last:border-b-0 last:pb-0">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 class="font-bold text-slate-950">{{ management.gerencia }}</h3>
              <p class="text-sm text-slate-700">{{ management.responsable.nombre || management.gerente || 'Sin responsable asignado' }}</p>
              <p class="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                <Smartphone class="size-3.5" aria-hidden="true" />
                {{ formatPhone(management.responsable.telefono) || 'Sin teléfono registrado' }}
              </p>
            </div>
            <span class="text-sm font-bold text-slate-950">{{ formatCurrency(management.efectivo.total) }}</span>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2">
            <CashAmountCell
              label="Con gerente"
              :amount="management.efectivo.conGerente"
              actionable
              @contact="contact(management, `Efectivo con gerente a las ${hourLabel(point.hora)}`, management.efectivo.conGerente)"
            />
            <CashAmountCell
              label="Con agencias"
              :amount="management.efectivo.conAgentes"
              actionable
              @contact="contact(management, `Efectivo con agencias a las ${hourLabel(point.hora)}`, management.efectivo.conAgentes)"
            />
          </div>

          <details v-if="management.agencias.length" class="mt-3">
            <summary class="cursor-pointer text-sm font-semibold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700">
              Ver {{ management.agencias.length }} agencias en esta hora
            </summary>
            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              <CashAmountCell
                v-for="agency in management.agencias"
                :key="agency.agencia"
                :label="agency.agencia"
                :amount="agency.efectivoEnCampo"
                actionable
                @contact="contact(management, `Efectivo de ${agency.agencia} a las ${hourLabel(point.hora)}`, agency.efectivoEnCampo)"
              />
            </div>
          </details>
        </section>
      </div>
    </details>
  </div>
  <p v-else class="px-4 py-12 text-center text-sm text-slate-600">Todavía no hay snapshots de efectivo para hoy.</p>
</template>
