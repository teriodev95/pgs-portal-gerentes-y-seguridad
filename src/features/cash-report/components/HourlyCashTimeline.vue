<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDownRight, ArrowUpRight, ChevronDown, Clock3, Smartphone } from 'lucide-vue-next'
import { formatPhone } from '@/shared/utils/phone'
import AgencyCashRow from './AgencyCashRow.vue'
import CashAmountCell from './CashAmountCell.vue'
import HourlyCashChart from './HourlyCashChart.vue'
import { formatCurrency, getCashLevel } from '../cash-report.utils'
import type {
  CashContactContext,
  HourlyCashPoint,
  HourlyCashReport,
  HourlyManagementCash
} from '../cash-report.types'

const props = defineProps<{ report: HourlyCashReport }>()
const emit = defineEmits<{ contact: [context: CashContactContext] }>()

const selectedHour = ref<number | null>(null)
const hoursNewestFirst = computed(() => [...props.report.horas].reverse())

function hourLabel(hour: number | null) {
  if (hour == null) return '—'
  return `${String(hour).padStart(2, '0')}:00`
}

/**
 * El total entra en la cuenta junto con sus partes: repartido, un mismo bulto
 * pasa por debajo del umbral en cada una y la gerencia no se contaba, aunque
 * trajera casi $40k en campo.
 */
function alertCount(point: HourlyCashPoint) {
  return point.gerencias.filter((management) =>
    [
      management.efectivo.total,
      management.efectivo.conGerente,
      management.efectivo.conAgentes,
      ...management.agencias.map((agency) => agency.efectivoEnCampo)
    ].some((amount) => getCashLevel(amount) === 'red')
  ).length
}

function contact(management: HourlyManagementCash, concept: string, amount: number) {
  const { total, conGerente, conAgentes } = management.efectivo

  emit('contact', {
    gerencia: management.gerencia,
    responsable: management.responsable,
    concepto: concept,
    monto: amount,
    desglose: { total, conGerente, conAgentes }
  })
}

function isPeak(point: HourlyCashPoint) {
  return point.hora === props.report.resumen.pico?.hora
}

function onSelectHour(hour: number) {
  selectedHour.value = hour
  const element = document.getElementById(`hour-snapshot-${hour}`)
  if (element) {
    if (element instanceof HTMLDetailsElement) {
      element.open = true
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Top Summary Metrics -->
    <section
      class="grid grid-cols-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5"
      aria-label="Resumen de la evolución de hoy"
    >
      <div>
        <span class="block text-xs font-medium text-slate-500">Pico de hoy</span>
        <strong class="mt-1 block text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {{ formatCurrency(report.resumen.pico?.granTotal ?? null) }}
        </strong>
        <span class="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-400">
          <Clock3 class="size-3" aria-hidden="true" />
          {{ hourLabel(report.resumen.pico?.hora ?? null) }}
        </span>
      </div>
      <div class="border-l border-slate-100 pl-4 sm:pl-6">
        <span class="block text-xs font-medium text-slate-500">Última snapshot</span>
        <strong class="mt-1 block text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {{ hourLabel(report.resumen.ultimaHora) }}
        </strong>
        <span class="mt-0.5 block text-xs font-medium text-slate-400">
          {{ report.resumen.horasDisponibles }} horas registradas
        </span>
      </div>
    </section>

    <!-- Hourly Cash Bar Chart -->
    <HourlyCashChart :report="report" @select-hour="onSelectHour" />

    <!-- Info Notice -->
    <div class="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-900">
      <p class="font-semibold text-blue-950">Evolución horaria oficial</p>
      <p class="mt-0.5 text-blue-800/90">
        Cada bloque compara contra la snapshot anterior disponible. Las horas ausentes permanecen vacías.
      </p>
    </div>

    <!-- Snapshots Timeline List -->
    <div v-if="hoursNewestFirst.length" class="space-y-3">
      <details
        v-for="point in hoursNewestFirst"
        :id="`hour-snapshot-${point.hora}`"
        :key="point.hora"
        class="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
        :open="point.hora === report.resumen.ultimaHora || isPeak(point) || point.hora === selectedHour"
      >
        <summary
          class="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:px-5"
        >
          <div class="flex items-center gap-3">
            <span
              class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700"
            >
              <Clock3 class="size-4" aria-hidden="true" />
            </span>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <strong class="text-base font-bold text-slate-900">{{ hourLabel(point.hora) }}</strong>
                <span
                  v-if="isPeak(point)"
                  class="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white"
                >
                  Pico del día
                </span>
                <span
                  v-if="alertCount(point)"
                  class="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                >
                  {{ alertCount(point) }} {{ alertCount(point) === 1 ? 'en rojo' : 'en rojo' }}
                </span>
              </div>
              <p
                v-if="point.comparacion.cambioDesdeAnterior != null"
                class="mt-0.5 inline-flex items-center gap-1 text-xs font-medium"
                :class="point.comparacion.cambioDesdeAnterior <= 0 ? 'text-emerald-700' : 'text-rose-700'"
              >
                <ArrowDownRight
                  v-if="point.comparacion.cambioDesdeAnterior <= 0"
                  class="size-3.5"
                  aria-hidden="true"
                />
                <ArrowUpRight v-else class="size-3.5" aria-hidden="true" />
                {{ point.comparacion.cambioDesdeAnterior <= 0 ? 'Bajó' : 'Subió' }}
                {{ formatCurrency(Math.abs(point.comparacion.cambioDesdeAnterior)) }} desde
                {{ hourLabel(point.comparacion.horaAnterior) }}
              </p>
              <p v-else class="mt-0.5 text-xs text-slate-400">Primera snapshot disponible</p>
            </div>
          </div>
          <div class="flex items-center gap-3 text-right">
            <div>
              <span class="block text-xs font-medium text-slate-500">Total</span>
              <strong class="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                {{ formatCurrency(point.totales.granTotal) }}
              </strong>
            </div>
            <ChevronDown
              class="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </div>
        </summary>

        <div class="space-y-3 border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
          <section
            v-for="management in point.gerencias"
            :key="management.gerencia"
            class="rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs sm:p-4"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 class="font-bold text-slate-900">{{ management.gerencia }}</h3>
                <p class="text-xs font-medium text-slate-600">
                  {{ management.responsable.nombre || management.gerente || 'Sin responsable asignado' }}
                </p>
                <p class="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400">
                  <Smartphone class="size-3" aria-hidden="true" />
                  {{ formatPhone(management.responsable.telefono) || 'Sin teléfono' }}
                </p>
              </div>
              <span class="text-sm font-bold tracking-tight text-slate-900">
                {{ formatCurrency(management.efectivo.total) }}
              </span>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3.5 py-2.5">
              <div>
                <span class="block text-[11px] font-medium text-slate-500">Con gerente</span>
                <div class="mt-0.5 flex items-center justify-between gap-1.5">
                  <strong
                    class="text-sm font-bold tracking-tight"
                    :class="getCashLevel(management.efectivo.conGerente) === 'red' ? 'text-red-700' : 'text-slate-900'"
                  >
                    {{ formatCurrency(management.efectivo.conGerente) }}
                  </strong>
                  <button
                    v-if="getCashLevel(management.efectivo.conGerente) === 'red'"
                    type="button"
                    class="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-2xs transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                    @click="
                      contact(
                        management,
                        `Efectivo con gerente a las ${hourLabel(point.hora)}`,
                        management.efectivo.conGerente
                      )
                    "
                  >
                    <PhoneCall class="size-2.5" aria-hidden="true" />
                    Contactar
                  </button>
                </div>
              </div>

              <div class="border-l border-slate-200/80 pl-3.5">
                <span class="block text-[11px] font-medium text-slate-500">Con agencias</span>
                <div class="mt-0.5 flex items-center justify-between gap-1.5">
                  <strong
                    class="text-sm font-bold tracking-tight"
                    :class="getCashLevel(management.efectivo.conAgentes) === 'red' ? 'text-red-700' : 'text-slate-900'"
                  >
                    {{ formatCurrency(management.efectivo.conAgentes) }}
                  </strong>
                  <button
                    v-if="getCashLevel(management.efectivo.conAgentes) === 'red'"
                    type="button"
                    class="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-2xs transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                    @click="
                      contact(
                        management,
                        `Efectivo con agencias a las ${hourLabel(point.hora)}`,
                        management.efectivo.conAgentes
                      )
                    "
                  >
                    <PhoneCall class="size-2.5" aria-hidden="true" />
                    Contactar
                  </button>
                </div>
              </div>
            </div>

            <details v-if="management.agencias.length" class="mt-3 border-t border-slate-100 pt-2.5">
              <summary
                class="cursor-pointer text-xs font-semibold text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Ver {{ management.agencias.length }} agencias en esta hora
              </summary>
              <div class="mt-2.5 grid gap-2 sm:grid-cols-2">
                <AgencyCashRow
                  v-for="agency in management.agencias"
                  :key="agency.agencia"
                  :agency="agency.agencia"
                  :closed="agency.cerrada"
                  :amount="agency.efectivoEnCampo"
                  actionable
                  @contact="
                    contact(
                      management,
                      `Efectivo de ${agency.agencia} a las ${hourLabel(point.hora)}`,
                      agency.efectivoEnCampo
                    )
                  "
                />
              </div>
            </details>
          </section>
        </div>
      </details>
    </div>
    <p v-else class="rounded-2xl border border-slate-200/80 bg-white px-4 py-12 text-center text-sm text-slate-500">
      Todavía no hay snapshots de efectivo para hoy.
    </p>
  </div>
</template>
