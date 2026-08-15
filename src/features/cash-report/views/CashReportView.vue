<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, Clock3, RefreshCw, ShieldCheck } from 'lucide-vue-next'
import MainCT from '@/shared/components/ui/MainCT.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import { useStore } from '@/shared/stores'
import AgencyCashRow from '../components/AgencyCashRow.vue'
import CashAmountCell from '../components/CashAmountCell.vue'
import CashContactDrawer from '../components/CashContactDrawer.vue'
import HourlyCashTimeline from '../components/HourlyCashTimeline.vue'
import ManagementCashItem from '../components/ManagementCashItem.vue'
import {
  getCashReportBranches,
  getDefaultReportDay,
  REPORT_DAYS,
  type ReportDay
} from '../cash-report.constants'
import { cashReportError, cashReportService } from '../cash-report.service'
import { formatCurrency, formatMexicoDateTime, getCashLevel } from '../cash-report.utils'
import type {
  CashContactContext,
  CurrentCashReport,
  HistoricalCashReport,
  HourlyCashReport
} from '../cash-report.types'

type ReportMode = 'current' | 'today' | 'history'

const $store = useStore()
const router = useRouter()
const branches = computed(() => getCashReportBranches($store.user))
const selectedBranch = ref('')
const reportMode = ref<ReportMode>('current')
const reportDay = ref<ReportDay>(getDefaultReportDay())
const currentReport = ref<CurrentCashReport | null>(null)
const todayReport = ref<HourlyCashReport | null>(null)
const historyReport = ref<HistoricalCashReport | null>(null)
const currentError = ref('')
const todayError = ref('')
const historyError = ref('')
const loadingCurrent = ref(false)
const loadingToday = ref(false)
const loadingHistory = ref(false)
const contact = ref<CashContactContext | null>(null)
const contactOpen = ref(false)
let currentRequest = 0
let todayRequest = 0
let historyRequest = 0

const selectedBranchName = computed(
  () => branches.value.find((branch) => branch.slug === selectedBranch.value)?.name ?? 'Sucursal'
)
const refreshedAt = computed(() => {
  if (reportMode.value === 'current' && currentReport.value) {
    return `Actualizado ${formatMexicoDateTime(currentReport.value.actualizadoEn)}`
  }
  if (reportMode.value === 'today' && todayReport.value) {
    return `${todayReport.value.fechaMx} · snapshots horarias`
  }
  if (reportMode.value === 'history' && historyReport.value) {
    return `Consultado ${formatMexicoDateTime(historyReport.value.generadoEn)}`
  }
  return 'Hora de Ciudad de México'
})

async function loadCurrent() {
  if (!selectedBranch.value) return
  const request = ++currentRequest
  loadingCurrent.value = true
  currentError.value = ''

  try {
    const data = await cashReportService.getCurrent(selectedBranch.value)
    if (request === currentRequest) currentReport.value = data
  } catch (error) {
    if (request === currentRequest) {
      currentReport.value = null
      currentError.value = cashReportError(error)
    }
  } finally {
    if (request === currentRequest) loadingCurrent.value = false
  }
}

async function loadToday() {
  if (!selectedBranch.value) return
  const request = ++todayRequest
  loadingToday.value = true
  todayError.value = ''

  try {
    const data = await cashReportService.getTodayEvolution(selectedBranch.value)
    if (request === todayRequest) todayReport.value = data
  } catch (error) {
    if (request === todayRequest) {
      todayReport.value = null
      todayError.value = cashReportError(error)
    }
  } finally {
    if (request === todayRequest) loadingToday.value = false
  }
}

async function loadHistory() {
  if (!selectedBranch.value) return
  const request = ++historyRequest
  loadingHistory.value = true
  historyError.value = ''

  try {
    const data = await cashReportService.getHistory(selectedBranch.value, reportDay.value)
    if (request === historyRequest) historyReport.value = data
  } catch (error) {
    if (request === historyRequest) {
      historyReport.value = null
      historyError.value = cashReportError(error)
    }
  } finally {
    if (request === historyRequest) loadingHistory.value = false
  }
}

function changeMode(mode: ReportMode) {
  reportMode.value = mode
  if (mode === 'today' && !todayReport.value) void loadToday()
  if (mode === 'history' && !historyReport.value) void loadHistory()
}

function refresh() {
  if (reportMode.value === 'current') void loadCurrent()
  else if (reportMode.value === 'today') void loadToday()
  else void loadHistory()
}

function openContact(context: CashContactContext) {
  contact.value = context
  contactOpen.value = true
}

watch(selectedBranch, () => {
  currentRequest += 1
  todayRequest += 1
  historyRequest += 1
  currentReport.value = null
  todayReport.value = null
  historyReport.value = null
  void loadCurrent()
  if (reportMode.value === 'today') void loadToday()
  if (reportMode.value === 'history') void loadHistory()
})

watch(reportDay, () => {
  historyReport.value = null
  if (reportMode.value === 'history') void loadHistory()
})

onMounted(() => {
  selectedBranch.value = branches.value[0]?.slug ?? ''
})
</script>

<template>
  <MainCT>
    <NavbarCT
      title="Efectivo general"
      :subtitles="[`Semana en curso · ${selectedBranchName}`, refreshedAt]"
      show-back-button
      @back="router.back()"
    />

    <div class="mx-auto w-full max-w-4xl space-y-4 px-4 py-4 pb-12 sm:px-6">
      <!-- Control Bar -->
      <section class="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label class="block flex-1 text-xs font-semibold text-slate-700">
            Sucursal autorizada
            <select
              v-model="selectedBranch"
              class="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-semibold text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option v-for="branch in branches" :key="branch.code" :value="branch.slug">
                {{ branch.name }} · {{ branch.code }}
              </option>
            </select>
          </label>

          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loadingCurrent || loadingToday || loadingHistory || !selectedBranch"
            @click="refresh"
          >
            <RefreshCw
              class="size-3.5"
              :class="{ 'animate-spin': loadingCurrent || loadingToday || loadingHistory }"
              aria-hidden="true"
            />
            Actualizar
          </button>
        </div>

        <div class="grid grid-cols-3 gap-1 rounded-xl bg-slate-100/80 p-1" role="group" aria-label="Tipo de reporte">
          <button
            type="button"
            :aria-pressed="reportMode === 'current'"
            class="min-h-9 rounded-lg px-3 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-600"
            :class="reportMode === 'current' ? 'bg-white font-bold text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="changeMode('current')"
          >
            Actual
          </button>
          <button
            type="button"
            :aria-pressed="reportMode === 'today'"
            class="min-h-9 rounded-lg px-2 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-600"
            :class="reportMode === 'today' ? 'bg-white font-bold text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="changeMode('today')"
          >
            Evolución hoy
          </button>
          <button
            type="button"
            :aria-pressed="reportMode === 'history'"
            class="min-h-9 rounded-lg px-3 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-600"
            :class="reportMode === 'history' ? 'bg-white font-bold text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="changeMode('history')"
          >
            Semanas
          </button>
        </div>
      </section>

      <!-- Semáforo Legend -->
      <section class="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs sm:px-5" aria-label="Leyenda del semáforo">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-semibold text-slate-700">Semáforo de efectivo</span>
          <span class="text-[11px] text-slate-400">Saldos negativos se señalan en rojo</span>
        </div>
        <div class="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div class="flex items-center gap-2 rounded-lg border border-emerald-200/70 bg-emerald-50/60 px-2.5 py-1.5 text-xs text-emerald-950">
            <span class="size-2 shrink-0 rounded-full bg-emerald-500" />
            <div class="leading-tight">
              <strong class="block text-xs">$1 – $19.9k</strong>
              <span class="text-[10px] text-emerald-700">Normal</span>
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-lg border border-amber-200/70 bg-amber-50/60 px-2.5 py-1.5 text-xs text-amber-950">
            <span class="size-2 shrink-0 rounded-full bg-amber-500" />
            <div class="leading-tight">
              <strong class="block text-xs">$20k – $24.9k</strong>
              <span class="text-[10px] text-amber-700">Seguimiento</span>
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-lg border border-rose-200/70 bg-rose-50/60 px-2.5 py-1.5 text-xs text-rose-950">
            <span class="size-2 shrink-0 rounded-full bg-rose-400" />
            <div class="leading-tight">
              <strong class="block text-xs">$25k – $29.9k</strong>
              <span class="text-[10px] text-rose-700">Atención</span>
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-lg border border-red-200/70 bg-red-50/60 px-2.5 py-1.5 text-xs text-red-950">
            <span class="size-2 shrink-0 rounded-full bg-red-600" />
            <div class="leading-tight">
              <strong class="block text-xs">$30k+ o menor</strong>
              <span class="text-[10px] text-red-700">Contactar</span>
            </div>
          </div>
        </div>
      </section>

      <!-- View Modes -->
      <template v-if="reportMode === 'current'">
        <div v-if="loadingCurrent" class="space-y-3" aria-live="polite" aria-label="Cargando reporte actual">
          <div v-for="item in 4" :key="item" class="h-36 animate-pulse rounded-2xl bg-slate-200/70" />
        </div>

        <section v-else-if="currentError" class="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs" role="alert">
          <h2 class="text-base font-bold text-slate-900">No pudimos abrir el reporte</h2>
          <p class="mx-auto mt-1.5 max-w-md text-xs text-slate-500">{{ currentError }}</p>
          <button
            type="button"
            class="mt-4 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            @click="loadCurrent"
          >
            Intentar de nuevo
          </button>
        </section>

        <template v-else-if="currentReport">
          <!-- Totals Card -->
          <section class="grid grid-cols-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5" aria-label="Totales de la sucursal">
            <div class="text-center">
              <span class="block text-xs font-medium text-slate-500">Con gerentes</span>
              <strong class="mt-1 block text-base font-bold tracking-tight text-slate-900 sm:text-xl">
                {{ formatCurrency(currentReport.totales.conGerente) }}
              </strong>
            </div>
            <div class="border-x border-slate-100 text-center">
              <span class="block text-xs font-medium text-slate-500">Con agencias</span>
              <strong class="mt-1 block text-base font-bold tracking-tight text-slate-900 sm:text-xl">
                {{ formatCurrency(currentReport.totales.conAgentes) }}
              </strong>
            </div>
            <div class="text-center">
              <span class="block text-xs font-medium text-slate-500">Total</span>
              <strong class="mt-1 block text-base font-bold tracking-tight text-blue-700 sm:text-xl">
                {{ formatCurrency(currentReport.totales.granTotal) }}
              </strong>
            </div>
          </section>

          <!-- Managements List -->
          <div v-if="currentReport.gerencias.length" class="space-y-3" aria-live="polite">
            <ManagementCashItem
              v-for="management in currentReport.gerencias"
              :key="management.gerencia"
              :management="management"
              @contact="openContact"
            />
          </div>
          <p v-else class="rounded-2xl border border-slate-200/80 bg-white px-4 py-12 text-center text-sm text-slate-500">
            No hay gerencias activas en esta sucursal.
          </p>
        </template>
      </template>

      <template v-else-if="reportMode === 'today'">
        <div v-if="loadingToday" class="space-y-3" aria-live="polite" aria-label="Cargando evolución de hoy">
          <div v-for="item in 4" :key="item" class="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
        </div>

        <section v-else-if="todayError" class="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs" role="alert">
          <h2 class="text-base font-bold text-slate-900">No pudimos abrir la evolución de hoy</h2>
          <p class="mx-auto mt-1.5 max-w-md text-xs text-slate-500">{{ todayError }}</p>
          <button
            type="button"
            class="mt-4 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            @click="loadToday"
          >
            Intentar de nuevo
          </button>
        </section>

        <HourlyCashTimeline v-else-if="todayReport" :report="todayReport" @contact="openContact" />
      </template>

      <template v-else>
        <!-- History Day Selector -->
        <section class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label class="block text-xs font-semibold text-slate-700">Reporte al término del día</label>
              <p class="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck class="size-3.5 text-slate-400" aria-hidden="true" />
                Sólo snapshots oficiales de cierre
              </p>
            </div>
            <select
              v-model="reportDay"
              class="min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-semibold text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-48"
            >
              <option v-for="day in REPORT_DAYS" :key="day" :value="day">{{ day }}</option>
            </select>
          </div>
        </section>

        <div v-if="loadingHistory" class="space-y-3" aria-live="polite" aria-label="Cargando histórico">
          <div v-for="item in 3" :key="item" class="h-32 animate-pulse rounded-2xl bg-slate-200/70" />
        </div>

        <section v-else-if="historyError" class="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs" role="alert">
          <h2 class="text-base font-bold text-slate-900">No pudimos abrir el histórico</h2>
          <p class="mx-auto mt-1.5 max-w-md text-xs text-slate-500">{{ historyError }}</p>
          <button
            type="button"
            class="mt-4 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            @click="loadHistory"
          >
            Intentar de nuevo
          </button>
        </section>

        <div v-else-if="historyReport?.semanas.length" class="space-y-3">
          <details
            v-for="(week, index) in historyReport.semanas"
            :key="`${week.periodo.anio}-${week.periodo.semana}`"
            class="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
            :open="index === historyReport.semanas.length - 1"
          >
            <summary
              class="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:px-5"
            >
              <div>
                <strong class="block text-base font-bold text-slate-900">
                  Semana {{ week.periodo.semana }} · {{ week.periodo.anio }}
                </strong>
                <span class="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                  <Clock3 class="size-3" aria-hidden="true" />
                  {{ week.corte ? `${week.corte.fechaMx} · corte ${week.corte.horaReal}:00` : 'Sin snapshot oficial' }}
                </span>
              </div>
              <div class="flex items-center gap-2.5">
                <span
                  class="rounded-md px-2 py-0.5 text-xs font-semibold"
                  :class="
                    week.completo
                      ? 'border border-emerald-200/70 bg-emerald-50/60 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  "
                >
                  {{ week.completo ? formatCurrency(week.totales?.granTotal ?? null) : 'Sin captura' }}
                </span>
                <ChevronDown
                  class="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </div>
            </summary>

            <div v-if="week.disponible" class="space-y-3 border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
              <section
                v-for="management in week.gerencias"
                :key="management.gerencia"
                class="rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs sm:p-4"
              >
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 class="font-bold text-slate-900">{{ management.gerencia }}</h3>
                    <p class="text-xs font-medium text-slate-600">
                      {{ management.gerente || 'Sin responsable asignado' }}
                    </p>
                  </div>
                  <span
                    v-if="management.conciliacionAgencias?.consistente === false"
                    class="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                  >
                    Agencias por conciliar
                  </span>
                </div>

                <div class="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-2.5 text-center sm:px-3">
                  <div>
                    <span class="block text-[11px] font-medium text-slate-500">Gerente</span>
                    <strong
                      class="mt-0.5 block text-xs font-bold tracking-tight sm:text-sm"
                      :class="getCashLevel(management.efectivo?.conGerente ?? null) === 'red' ? 'text-red-700' : 'text-slate-900'"
                    >
                      {{ formatCurrency(management.efectivo?.conGerente ?? null) }}
                    </strong>
                  </div>

                  <div class="border-x border-slate-200/80 px-1">
                    <span class="block text-[11px] font-medium text-slate-500">Agencias</span>
                    <strong
                      class="mt-0.5 block text-xs font-bold tracking-tight sm:text-sm"
                      :class="getCashLevel(management.efectivo?.conAgentes ?? null) === 'red' ? 'text-red-700' : 'text-slate-900'"
                    >
                      {{ formatCurrency(management.efectivo?.conAgentes ?? null) }}
                    </strong>
                  </div>

                  <div>
                    <span class="block text-[11px] font-medium text-slate-500">Total</span>
                    <strong
                      class="mt-0.5 block text-xs font-bold tracking-tight sm:text-sm"
                      :class="getCashLevel(management.efectivo?.total ?? null) === 'red' ? 'text-red-700' : 'text-slate-900'"
                    >
                      {{ formatCurrency(management.efectivo?.total ?? null) }}
                    </strong>
                  </div>
                </div>

                <details v-if="management.agencias.length" class="mt-3 border-t border-slate-100 pt-2.5">
                  <summary
                    class="cursor-pointer text-xs font-semibold text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    Desglosar {{ management.agencias.length }} agencias
                  </summary>
                  <div class="mt-2.5 grid gap-2 sm:grid-cols-2">
                    <AgencyCashRow
                      v-for="agency in management.agencias"
                      :key="agency.agencia"
                      :agency="agency.agencia"
                      :amount="agency.efectivoEnCampo"
                    />
                  </div>
                </details>
              </section>
            </div>
            <p v-else class="border-t border-slate-100 bg-slate-50/50 px-4 py-6 text-xs text-slate-400 sm:px-5">
              Esta semana aún no tenía captura de efectivo oficial. Se conserva sin valor para no inducir a error.
            </p>
          </details>
        </div>
        <p v-else-if="historyReport" class="rounded-2xl border border-slate-200/80 bg-white px-4 py-12 text-center text-sm text-slate-500">
          Todavía no hay snapshots oficiales para este rango de semanas.
        </p>
      </template>
    </div>

    <CashContactDrawer v-model:open="contactOpen" :contact="contact" />
  </MainCT>
</template>
