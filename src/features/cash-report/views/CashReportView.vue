<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, Clock3, RefreshCw, ShieldCheck } from 'lucide-vue-next'
import MainCT from '@/shared/components/ui/MainCT.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import { useStore } from '@/shared/stores'
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
import { formatCurrency, formatMexicoDateTime } from '../cash-report.utils'
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

    <div class="mx-auto w-full max-w-5xl pb-12">
      <section class="border-y border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label class="block max-w-sm flex-1 text-sm font-semibold text-slate-800">
            Sucursal autorizada
            <select
              v-model="selectedBranch"
              class="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
            >
              <option v-for="branch in branches" :key="branch.code" :value="branch.slug">
                {{ branch.name }} · {{ branch.code }}
              </option>
            </select>
          </label>

          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-700 bg-white px-4 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loadingCurrent || loadingToday || loadingHistory || !selectedBranch"
            @click="refresh"
          >
            <RefreshCw class="size-4" :class="{ 'animate-spin': loadingCurrent || loadingToday || loadingHistory }" aria-hidden="true" />
            Actualizar
          </button>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1" role="group" aria-label="Tipo de reporte">
          <button
            type="button"
            :aria-pressed="reportMode === 'current'"
            class="min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700"
            :class="reportMode === 'current' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            @click="changeMode('current')"
          >
            Actual
          </button>
          <button
            type="button"
            :aria-pressed="reportMode === 'today'"
            class="min-h-10 rounded-lg px-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700"
            :class="reportMode === 'today' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            @click="changeMode('today')"
          >
            Evolución hoy
          </button>
          <button
            type="button"
            :aria-pressed="reportMode === 'history'"
            class="min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700"
            :class="reportMode === 'history' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            @click="changeMode('history')"
          >
            Semanas
          </button>
        </div>
      </section>

      <section class="border-b border-slate-200 bg-white px-4 py-4 sm:px-6" aria-label="Leyenda del formato condicional">
        <p class="text-sm font-semibold text-slate-900">Semáforo del Excel</p>
        <div class="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-700">
          <span class="inline-flex items-center gap-1.5"><i class="size-3 rounded-sm bg-[#C6EFCE]" />$1–$19,999</span>
          <span class="inline-flex items-center gap-1.5"><i class="size-3 rounded-sm bg-[#FFEB9C]" />$20,000–$24,999</span>
          <span class="inline-flex items-center gap-1.5"><i class="size-3 rounded-sm bg-[#FFC7CE]" />$25,000–$29,999</span>
          <span class="inline-flex items-center gap-1.5"><i class="size-3 rounded-sm bg-[#FF0000]" />$30,000 o más</span>
        </div>
        <p class="mt-2 text-xs text-slate-500">Los saldos negativos también se marcan en rojo para revisión.</p>
      </section>

      <template v-if="reportMode === 'current'">
        <div v-if="loadingCurrent" class="space-y-3 px-4 py-5" aria-live="polite" aria-label="Cargando reporte actual">
          <div v-for="item in 4" :key="item" class="h-40 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <section v-else-if="currentError" class="px-4 py-10 text-center" role="alert">
          <h2 class="text-lg font-bold text-slate-950">No pudimos abrir el reporte</h2>
          <p class="mx-auto mt-2 max-w-md text-sm text-slate-600">{{ currentError }}</p>
          <button type="button" class="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2" @click="loadCurrent">
            Intentar de nuevo
          </button>
        </section>

        <template v-else-if="currentReport">
          <section class="grid grid-cols-3 border-b border-slate-200 bg-slate-950 text-white" aria-label="Totales de la sucursal">
            <div class="px-3 py-4 text-center sm:px-5">
              <span class="block text-xs text-slate-300">Con gerentes</span>
              <strong class="mt-1 block text-base sm:text-xl">{{ formatCurrency(currentReport.totales.conGerente) }}</strong>
            </div>
            <div class="border-x border-slate-700 px-3 py-4 text-center sm:px-5">
              <span class="block text-xs text-slate-300">Con agencias</span>
              <strong class="mt-1 block text-base sm:text-xl">{{ formatCurrency(currentReport.totales.conAgentes) }}</strong>
            </div>
            <div class="px-3 py-4 text-center sm:px-5">
              <span class="block text-xs text-slate-300">Total</span>
              <strong class="mt-1 block text-base sm:text-xl">{{ formatCurrency(currentReport.totales.granTotal) }}</strong>
            </div>
          </section>

          <div v-if="currentReport.gerencias.length" class="divide-y divide-slate-200" aria-live="polite">
            <ManagementCashItem
              v-for="management in currentReport.gerencias"
              :key="management.gerencia"
              :management="management"
              @contact="openContact"
            />
          </div>
          <p v-else class="px-4 py-12 text-center text-sm text-slate-600">No hay gerencias activas en esta sucursal.</p>
        </template>
      </template>

      <template v-else-if="reportMode === 'today'">
        <div v-if="loadingToday" class="space-y-3 px-4 py-5" aria-live="polite" aria-label="Cargando evolución de hoy">
          <div v-for="item in 4" :key="item" class="h-28 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <section v-else-if="todayError" class="px-4 py-10 text-center" role="alert">
          <h2 class="text-lg font-bold text-slate-950">No pudimos abrir la evolución de hoy</h2>
          <p class="mx-auto mt-2 max-w-md text-sm text-slate-600">{{ todayError }}</p>
          <button type="button" class="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2" @click="loadToday">
            Intentar de nuevo
          </button>
        </section>

        <HourlyCashTimeline v-else-if="todayReport" :report="todayReport" @contact="openContact" />
      </template>

      <template v-else>
        <section class="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <label class="block max-w-sm text-sm font-semibold text-slate-800">
            Reporte al término del día
            <select
              v-model="reportDay"
              class="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
            >
              <option v-for="day in REPORT_DAYS" :key="day" :value="day">{{ day }}</option>
            </select>
          </label>
          <p class="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck class="size-4" aria-hidden="true" />
            Sólo snapshots oficiales; una captura faltante permanece vacía.
          </p>
        </section>

        <div v-if="loadingHistory" class="space-y-3 px-4 py-5" aria-live="polite" aria-label="Cargando histórico">
          <div v-for="item in 3" :key="item" class="h-32 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <section v-else-if="historyError" class="px-4 py-10 text-center" role="alert">
          <h2 class="text-lg font-bold text-slate-950">No pudimos abrir el histórico</h2>
          <p class="mx-auto mt-2 max-w-md text-sm text-slate-600">{{ historyError }}</p>
          <button type="button" class="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2" @click="loadHistory">
            Intentar de nuevo
          </button>
        </section>

        <div v-else-if="historyReport?.semanas.length" class="divide-y divide-slate-300">
          <details
            v-for="(week, index) in historyReport.semanas"
            :key="`${week.periodo.anio}-${week.periodo.semana}`"
            class="group bg-white"
            :open="index === historyReport.semanas.length - 1"
          >
            <summary class="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-700 sm:px-6">
              <div>
                <strong class="block text-base text-slate-950">Semana {{ week.periodo.semana }} · {{ week.periodo.anio }}</strong>
                <span class="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock3 class="size-3.5" aria-hidden="true" />
                  {{ week.corte ? `${week.corte.fechaMx} · corte ${week.corte.horaReal}:00` : 'Sin snapshot oficial' }}
                </span>
              </div>
              <span class="flex items-center gap-2">
                <span class="text-sm font-semibold" :class="week.completo ? 'text-emerald-700' : 'text-slate-500'">
                  {{ week.completo ? formatCurrency(week.totales?.granTotal ?? null) : 'Sin captura completa' }}
                </span>
                <ChevronDown class="size-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" aria-hidden="true" />
              </span>
            </summary>

            <div v-if="week.disponible" class="border-t border-slate-200">
              <section v-for="management in week.gerencias" :key="management.gerencia" class="border-b border-slate-100 px-4 py-5 last:border-b-0 sm:px-6">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 class="font-bold text-slate-950">{{ management.gerencia }}</h3>
                    <p class="text-sm text-slate-600">{{ management.gerente || 'Sin responsable asignado' }}</p>
                  </div>
                  <span v-if="management.conciliacionAgencias?.consistente === false" class="text-xs font-semibold text-red-700">Agencias por conciliar</span>
                </div>

                <div class="mt-3 grid grid-cols-3 gap-2">
                  <CashAmountCell label="Gerente" :amount="management.efectivo?.conGerente ?? null" />
                  <CashAmountCell label="Agencias" :amount="management.efectivo?.conAgentes ?? null" />
                  <CashAmountCell label="Total" :amount="management.efectivo?.total ?? null" />
                </div>

                <details v-if="management.agencias.length" class="group/agency mt-3">
                  <summary class="cursor-pointer text-sm font-semibold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700">
                    Desglosar {{ management.agencias.length }} agencias
                  </summary>
                  <div class="mt-3 grid gap-2 sm:grid-cols-2">
                    <CashAmountCell
                      v-for="agency in management.agencias"
                      :key="agency.agencia"
                      :label="agency.agencia"
                      :amount="agency.efectivoEnCampo"
                    />
                  </div>
                </details>
              </section>
            </div>
            <p v-else class="border-t border-slate-200 px-4 py-6 text-sm text-slate-600 sm:px-6">
              Esta semana aún no tenía captura de efectivo. Se conserva sin valor para no inventar un cero.
            </p>
          </details>
        </div>
        <p v-else-if="historyReport" class="px-4 py-12 text-center text-sm text-slate-600">
          Todavía no hay snapshots oficiales para este rango de semanas.
        </p>
      </template>
    </div>

    <CashContactDrawer v-model:open="contactOpen" :contact="contact" />
  </MainCT>
</template>
