<script setup lang="ts">
/**
 * Fecha en un toque: Hoy y Ayer cubren casi todos los casos (97 % de las ventas se
 * capturan el mismo dia). "Otra fecha" abre un calendario en linea, sin popups ni
 * el selector nativo del navegador. Valor en formato YYYY-MM-DD, zona local.
 */
import { computed, ref, watch } from 'vue'
import CalendarIcon from '@/shared/components/icons/CalendarIcon.vue'
import AngleRight from '@/shared/components/icons/AngleRight.vue'

interface Props {
  modelValue: string
  /** Ultimo dia permitido (YYYY-MM-DD). Por defecto hoy: una venta no se registra a futuro. */
  max?: string
  /** Primer dia permitido (YYYY-MM-DD). */
  min?: string
}

interface Emits {
  (event: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const WEEKDAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
/** La semana Xpress empieza en lunes: asi se lee el calendario. */
const WEEK_HEADER = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)

const today = new Date()
const todayISO = toISO(today)
const yesterdayISO = toISO(addDays(today, -1))
const maxISO = computed(() => props.max ?? todayISO)

/** "mié 23 sep" para que la fecha se confirme de un vistazo. */
const shortLabel = (iso: string) => {
  const d = fromISO(iso)
  return `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

const isOtherDate = computed(
  () => Boolean(props.modelValue) && props.modelValue !== todayISO && props.modelValue !== yesterdayISO
)

const quickOptions = computed(() => [
  { value: todayISO, label: 'Hoy', detail: shortLabel(todayISO) },
  { value: yesterdayISO, label: 'Ayer', detail: shortLabel(yesterdayISO) },
])

// Calendario en linea
const isCalendarOpen = ref(false)
const viewMonth = ref(startOfMonth(props.modelValue ? fromISO(props.modelValue) : today))

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

const viewTitle = computed(
  () => `${MONTHS[viewMonth.value.getMonth()]} ${viewMonth.value.getFullYear()}`
)

/** Celdas del mes visible, alineadas a lunes; las vacias son relleno. */
const cells = computed(() => {
  const first = viewMonth.value
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const offset = (first.getDay() + 6) % 7 // lunes = 0
  const result: { iso: string; day: number; disabled: boolean }[] = []
  for (let i = 0; i < offset; i++) result.push({ iso: `pad-${i}`, day: 0, disabled: true })
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISO(new Date(first.getFullYear(), first.getMonth(), day))
    const disabled = iso > maxISO.value || (props.min !== undefined && iso < props.min)
    result.push({ iso, day, disabled })
  }
  return result
})

const canGoNext = computed(() => {
  const next = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + 1, 1)
  return toISO(next) <= maxISO.value
})

function shiftMonth(delta: number) {
  viewMonth.value = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + delta, 1)
}

function pick(iso: string) {
  emit('update:modelValue', iso)
  isCalendarOpen.value = false
}

function toggleCalendar() {
  isCalendarOpen.value = !isCalendarOpen.value
  if (isCalendarOpen.value) {
    viewMonth.value = startOfMonth(props.modelValue ? fromISO(props.modelValue) : today)
  }
}

// Si el valor cambia desde afuera (p. ej. limpiar formulario), el calendario se cierra
watch(() => props.modelValue, () => { isCalendarOpen.value = false })
</script>

<template>
  <div class="space-y-2">
    <div role="radiogroup" aria-label="Fecha" class="grid grid-cols-3 gap-2">
      <button
        v-for="option in quickOptions"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="modelValue === option.value"
        class="rounded-lg border p-2.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        :class="modelValue === option.value
          ? 'border-blue-700 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400'
          : 'border-slate-200 bg-white text-gray-600 hover:border-slate-300 hover:bg-slate-50 dark:border-gray-600 dark:bg-transparent dark:text-gray-400'"
        @click="pick(option.value)"
      >
        <span class="block text-sm font-medium">{{ option.label }}</span>
        <span class="mt-0.5 block text-xs leading-4 text-slate-500 dark:text-gray-400">{{ option.detail }}</span>
      </button>

      <!-- Otra fecha: muestra la elegida cuando no es hoy ni ayer -->
      <button
        type="button"
        role="radio"
        :aria-checked="isOtherDate"
        :aria-expanded="isCalendarOpen"
        class="rounded-lg border p-2.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        :class="isOtherDate || isCalendarOpen
          ? 'border-blue-700 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400'
          : 'border-slate-200 bg-white text-gray-600 hover:border-slate-300 hover:bg-slate-50 dark:border-gray-600 dark:bg-transparent dark:text-gray-400'"
        @click="toggleCalendar"
      >
        <span class="flex items-center justify-center gap-1 text-sm font-medium">
          <CalendarIcon class="size-4" />
          {{ isOtherDate ? shortLabel(modelValue) : 'Otra fecha' }}
        </span>
        <span class="mt-0.5 block text-xs leading-4 text-slate-500 dark:text-gray-400">
          {{ isCalendarOpen ? 'Cerrar' : isOtherDate ? 'Cambiar' : 'Elegir' }}
        </span>
      </button>
    </div>

    <div v-if="isCalendarOpen" class="rounded-xl border border-slate-200 bg-white p-3 dark:border-gray-600 dark:bg-transparent">
      <div class="mb-2 flex items-center justify-between">
        <button type="button" class="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Mes anterior" @click="shiftMonth(-1)">
          <AngleRight class="size-5 rotate-180" />
        </button>
        <span class="text-sm font-semibold capitalize text-slate-900 dark:text-white">{{ viewTitle }}</span>
        <button type="button" class="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Mes siguiente" :disabled="!canGoNext" @click="shiftMonth(1)">
          <AngleRight class="size-5" />
        </button>
      </div>

      <div class="grid grid-cols-7 gap-1 text-center">
        <span v-for="(d, i) in WEEK_HEADER" :key="`h-${i}`" class="py-1 text-xs font-medium text-slate-400">{{ d }}</span>
        <template v-for="cell in cells" :key="cell.iso">
          <span v-if="cell.day === 0" />
          <button
            v-else
            type="button"
            :disabled="cell.disabled"
            :aria-label="cell.iso"
            :aria-pressed="cell.iso === modelValue"
            class="aspect-square rounded-lg text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:text-slate-300 dark:disabled:text-gray-600"
            :class="[
              cell.iso === modelValue
                ? 'bg-blue-700 font-semibold text-white'
                : 'text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-gray-700',
              cell.iso === todayISO && cell.iso !== modelValue && 'ring-1 ring-inset ring-blue-400 font-semibold',
            ]"
            @click="pick(cell.iso)"
          >
            {{ cell.day }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
