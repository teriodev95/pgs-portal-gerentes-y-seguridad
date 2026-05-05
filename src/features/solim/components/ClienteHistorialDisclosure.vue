<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ChevronDown,
  LoaderCircle,
  RotateCw,
  History,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  FileX2
} from 'lucide-vue-next'
import { solimService } from '../services/solim.service'
import type { HistorialData, HistorialPrestamo } from '../types'

interface Props {
  personaId?: string | null
}

const props = defineProps<Props>()

const historial = ref<HistorialData | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const isExpanded = ref(false)

async function loadHistorial(): Promise<void> {
  if (!props.personaId) return
  isLoading.value = true
  error.value = null
  try {
    const response = await solimService.getClienteHistorial(props.personaId)
    if (response.data?.success) {
      historial.value = response.data.data
    } else {
      throw new Error('Respuesta sin éxito')
    }
  } catch {
    error.value = 'Historial no disponible'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.personaId,
  (next, prev) => {
    if (next === prev) return
    historial.value = null
    error.value = null
    isExpanded.value = false
    if (next) {
      loadHistorial()
    }
  },
  { immediate: true }
)

const sortedPrestamos = computed<HistorialPrestamo[]>(() => {
  const list = historial.value?.prestamos ?? []
  return list.slice().sort((a, b) => b.Anio - a.Anio || b.Semana - a.Semana)
})

const totalPrestamos = computed(() => sortedPrestamos.value.length)
const topPrestamos = computed(() => sortedPrestamos.value.slice(0, 3))

type Tone = 'good' | 'warn' | 'info' | 'muted'

const estadoGlobal = computed<{ label: string; tone: Tone }>(() => {
  if (!historial.value) return { label: '', tone: 'muted' }
  if (totalPrestamos.value === 0) return { label: 'Sin préstamos', tone: 'muted' }
  const conAtrasos = sortedPrestamos.value.some(
    (p) => p.semanas_sin_pago > 0 || p.semanas_reducidas_bajo_50 > 0
  )
  return conAtrasos
    ? { label: 'Con atrasos', tone: 'warn' }
    : { label: 'Al corriente', tone: 'good' }
})

const score = computed(() => historial.value?.score_final ?? null)

const scoreTone = computed<Tone>(() => {
  const s = score.value
  if (s === null) return 'muted'
  if (s >= 80) return 'good'
  if (s >= 50) return 'info'
  return 'warn'
})

const toneClasses: Record<Tone, { dot: string; text: string; bg: string }> = {
  good: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  warn: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
  info: { dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
  muted: { dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100' }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(value)
}

interface PrestamoStatus {
  label: string
  tone: Tone
  icon: typeof CheckCircle2
}

function prestamoStatus(p: HistorialPrestamo): PrestamoStatus {
  if (p.Saldo > 0) return { label: 'Activo', tone: 'info', icon: Clock3 }
  if (p.semanas_sin_pago > 0 || p.semanas_reducidas_bajo_50 > 0)
    return { label: 'Con atrasos', tone: 'warn', icon: AlertTriangle }
  return { label: 'Pagado', tone: 'good', icon: CheckCircle2 }
}

function toggle() {
  if (!historial.value) return
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <section v-if="personaId" class="space-y-2">
    <label class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
      <History class="size-3.5" />
      Historial del cliente
    </label>

    <div
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white transition"
      :class="historial && !error ? 'hover:border-slate-300' : ''"
    >
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 text-left transition focus:outline-none focus-visible:bg-slate-50"
        :class="[
          historial ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default',
          isExpanded ? 'bg-slate-50/60' : ''
        ]"
        :aria-expanded="isExpanded"
        :disabled="!historial"
        @click="toggle"
      >
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <div v-if="isLoading && !historial" class="flex items-center gap-2 text-sm text-slate-500">
            <LoaderCircle class="size-4 animate-spin" />
            Consultando historial...
          </div>

          <div v-else-if="error" class="flex items-center gap-3 text-sm">
            <FileX2 class="size-4 text-slate-400" />
            <span class="text-slate-600">{{ error }}</span>
            <span
              role="button"
              tabindex="0"
              class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
              @click.stop="loadHistorial"
              @keydown.enter.stop="loadHistorial"
            >
              <RotateCw class="size-3" /> Reintentar
            </span>
          </div>

          <template v-else-if="historial">
            <div
              v-if="score !== null"
              class="inline-flex shrink-0 items-baseline gap-1 rounded-md px-2 py-0.5 text-sm font-semibold"
              :class="[toneClasses[scoreTone].bg, toneClasses[scoreTone].text]"
            >
              <span class="text-[10px] font-medium uppercase tracking-wider opacity-70">Score</span>
              <span class="tabular-nums">{{ score }}</span>
            </div>

            <span class="text-sm text-slate-600 tabular-nums">
              {{ totalPrestamos }} préstamo{{ totalPrestamos === 1 ? '' : 's' }}
            </span>

            <span
              class="ml-auto inline-flex items-center gap-1.5 text-xs font-medium"
              :class="toneClasses[estadoGlobal.tone].text"
            >
              <span class="size-1.5 rounded-full" :class="toneClasses[estadoGlobal.tone].dot" />
              {{ estadoGlobal.label }}
            </span>
          </template>
        </div>

        <ChevronDown
          v-if="historial"
          class="size-4 shrink-0 text-slate-400 transition-transform duration-200"
          :class="isExpanded ? 'rotate-180 text-slate-600' : ''"
        />
      </button>

      <div
        v-if="isExpanded && historial"
        class="border-t border-slate-100 bg-white"
      >
        <p v-if="totalPrestamos === 0" class="px-4 py-3 text-sm text-slate-500">
          Sin préstamos previos registrados.
        </p>

        <ul v-else class="divide-y divide-slate-100">
          <li
            v-for="p in topPrestamos"
            :key="p.PrestamoID"
            class="flex items-center gap-3 px-4 py-3"
          >
            <span
              class="size-1.5 shrink-0 self-stretch translate-y-1 rounded-full"
              :class="toneClasses[prestamoStatus(p).tone].dot"
              aria-hidden="true"
            />
            <div class="min-w-0 flex-1">
              <p class="flex items-baseline gap-1.5 text-sm font-semibold text-slate-900">
                <span class="tabular-nums">{{ formatMoney(p.Monto_otorgado) }}</span>
                <span class="text-xs font-normal text-slate-500">· {{ p.plazo }} sem</span>
              </p>
              <p class="mt-0.5 text-xs text-slate-500 tabular-nums">
                {{ p.Anio }} · sem {{ p.Semana }} · {{ p.Gerencia }}
              </p>
            </div>
            <span
              class="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              :class="[
                toneClasses[prestamoStatus(p).tone].bg,
                toneClasses[prestamoStatus(p).tone].text
              ]"
            >
              <component :is="prestamoStatus(p).icon" class="size-3" />
              {{ prestamoStatus(p).label }}
            </span>
          </li>
        </ul>

        <p
          v-if="totalPrestamos > 3"
          class="border-t border-slate-100 px-4 py-2 text-xs text-slate-500"
        >
          + {{ totalPrestamos - 3 }} préstamo{{ totalPrestamos - 3 === 1 ? '' : 's' }} más en el historial
        </p>
      </div>
    </div>
  </section>
</template>
