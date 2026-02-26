import { ref, computed } from 'vue'
import { useStore } from '@/shared/stores'

export interface BusinessDay {
  key: string
  label: string
  shortLabel: string
  jsDay: number // 0=Domingo ... 6=Sábado
}

// Semana de negocio: Miércoles a Martes
const BUSINESS_DAYS: BusinessDay[] = [
  { key: 'miercoles', label: 'Miércoles', shortLabel: 'Mi', jsDay: 3 },
  { key: 'jueves', label: 'Jueves', shortLabel: 'Ju', jsDay: 4 },
  { key: 'viernes', label: 'Viernes', shortLabel: 'Vi', jsDay: 5 },
  { key: 'sabado', label: 'Sábado', shortLabel: 'Sa', jsDay: 6 },
  { key: 'domingo', label: 'Domingo', shortLabel: 'Do', jsDay: 0 },
  { key: 'lunes', label: 'Lunes', shortLabel: 'Lu', jsDay: 1 },
  { key: 'martes', label: 'Martes', shortLabel: 'Ma', jsDay: 2 },
]

/**
 * Obtiene la fecha del miércoles (inicio) de una semana ISO dada.
 * Semana ISO: lunes es día 1. El miércoles de esa semana ISO es día 3.
 */
function getWednesdayOfISOWeek(week: number, year: number): Date {
  // 4 de enero siempre está en la semana ISO 1
  const jan4 = new Date(year, 0, 4)
  const jan4Day = jan4.getDay() || 7 // Lunes=1 ... Domingo=7
  // Lunes de la semana ISO 1
  const mondayWeek1 = new Date(jan4)
  mondayWeek1.setDate(jan4.getDate() - (jan4Day - 1))
  // Miércoles de la semana solicitada
  const wednesday = new Date(mondayWeek1)
  wednesday.setDate(mondayWeek1.getDate() + (week - 1) * 7 + 2) // +2 = miércoles
  wednesday.setHours(0, 0, 0, 0)
  return wednesday
}

/**
 * Calcula la fecha real de un día de negocio dentro de una semana de negocio.
 * La semana de negocio empieza el miércoles.
 */
function getDateForBusinessDay(day: BusinessDay, week: number, year: number): Date {
  const wednesday = getWednesdayOfISOWeek(week, year)
  const dayIndex = BUSINESS_DAYS.findIndex(d => d.key === day.key)
  const date = new Date(wednesday)
  date.setDate(wednesday.getDate() + dayIndex)
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * Obtiene la semana ISO actual.
 */
function getCurrentISOWeek(): { week: number; year: number } {
  const now = new Date()
  const target = new Date(now.valueOf())
  const dayNum = target.getDay() || 7
  target.setDate(target.getDate() + 4 - dayNum)
  const yearStart = new Date(target.getFullYear(), 0, 1)
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { week, year: target.getFullYear() }
}

// Estado compartido fuera de la función para que sea singleton
const _selectedWeek = ref(0)
const _selectedYear = ref(0)
const _selectedDayKey = ref<string | null>(null)
let _initialized = false

export function useWeekDaySelector() {
  const $store = useStore()
  const current = getCurrentISOWeek()

  if (!_initialized) {
    _selectedWeek.value = $store.currentDate.week || current.week
    _selectedYear.value = $store.currentDate.year || current.year
    _initialized = true
  }

  const selectedWeek = _selectedWeek
  const selectedYear = _selectedYear
  const selectedDayKey = _selectedDayKey

  const days = computed(() => BUSINESS_DAYS)

  const currentWeek = computed(() => current.week)
  const currentYear = computed(() => current.year)

  /**
   * Verifica si un día es seleccionable.
   * - Miércoles nunca se envía (siempre deshabilitado)
   * - Los demás días se habilitan cuando el día ya llegó (hoy o antes)
   */
  function isDaySelectable(day: BusinessDay): boolean {
    if (day.key === 'miercoles') return false

    const dayDate = getDateForBusinessDay(day, selectedWeek.value, selectedYear.value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return today >= dayDate
  }

  /**
   * Verifica si se puede navegar a la semana siguiente.
   * No se permite ir más allá de la semana actual.
   */
  const canGoNext = computed(() => {
    if (selectedYear.value < currentYear.value) return true
    return selectedWeek.value < currentWeek.value
  })

  function nextWeek(): void {
    if (!canGoNext.value) return
    selectedWeek.value++
    selectedDayKey.value = null
    syncStore()
  }

  function prevWeek(): void {
    selectedWeek.value--
    selectedDayKey.value = null
    syncStore()
  }

  function selectDay(day: BusinessDay): void {
    if (!isDaySelectable(day)) return
    selectedDayKey.value = day.key
  }

  const selectedDay = computed(() =>
    BUSINESS_DAYS.find(d => d.key === selectedDayKey.value) ?? null
  )

  /**
   * Retorna el nombre del día en español (mayúsculas) para el API.
   */
  const selectedDaySpanish = computed(() => {
    if (!selectedDay.value) return ''
    return selectedDay.value.label.toUpperCase()
  })

  function syncStore(): void {
    $store.currentDate.week = selectedWeek.value
    $store.currentDate.year = selectedYear.value
  }

  // Sync inicial
  syncStore()

  return {
    days,
    selectedWeek,
    selectedYear,
    selectedDay,
    selectedDayKey,
    selectedDaySpanish,
    canGoNext,
    isDaySelectable,
    nextWeek,
    prevWeek,
    selectDay,
  }
}
