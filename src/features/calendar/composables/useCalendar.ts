import { ref, computed, type Ref } from 'vue'
import { calendarService } from '../services/calendar.service'
import type { CalendarWeek, CalendarView, MonthGroup } from '../types'

export function useCalendar() {
  const weeks: Ref<CalendarWeek[]> = ref([])
  const currentYear = ref(new Date().getFullYear())
  const currentView: Ref<CalendarView> = ref('anual')
  const selectedMonth = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const monthsGroup = computed<MonthGroup[]>(() => {
    const monthsMap = new Map<string, CalendarWeek[]>()

    weeks.value.forEach(week => {
      if (!monthsMap.has(week.mes)) {
        monthsMap.set(week.mes, [])
      }
      monthsMap.get(week.mes)!.push(week)
    })

    return Array.from(monthsMap.entries()).map(([month, monthWeeks]) => ({
      month,
      weeks: monthWeeks.sort((a, b) => a.semana - b.semana),
      weekCount: monthWeeks.length
    }))
  })

  const filteredMonths = computed<MonthGroup[]>(() => {
    if (currentView.value === 'mensual' && selectedMonth.value) {
      return monthsGroup.value.filter(month => month.month === selectedMonth.value)
    }
    return monthsGroup.value
  })

  const availableYears = computed(() => {
    const currentYearValue = new Date().getFullYear()
    return [
      currentYearValue - 1,  // Allow previous year (2024 if current is 2025)
      currentYearValue,
      currentYearValue + 1,
      currentYearValue + 2,
      currentYearValue + 3,
      currentYearValue + 4,
      currentYearValue + 5
    ]
  })

  const canNavigatePrevious = computed(() => {
    if (currentView.value === 'anual') {
      return availableYears.value.includes(currentYear.value - 1)
    } else {
      // In monthly view, can always go back if we have a previous year available
      // or if we're not on the first month of the current year
      const currentMonthIndex = monthsGroup.value.findIndex(
        month => month.month === selectedMonth.value
      )
      return currentMonthIndex > 0 || availableYears.value.includes(currentYear.value - 1)
    }
  })

  const canNavigateNext = computed(() => {
    if (currentView.value === 'anual') {
      return availableYears.value.includes(currentYear.value + 1)
    } else {
      // In monthly view, can always go forward if we have a next year available
      // or if we're not on the last month of the current year
      const currentMonthIndex = monthsGroup.value.findIndex(
        month => month.month === selectedMonth.value
      )
      return currentMonthIndex < monthsGroup.value.length - 1 || availableYears.value.includes(currentYear.value + 1)
    }
  })

  async function fetchCalendar(year?: number) {
    if (year) {
      currentYear.value = year
    }

    loading.value = true
    error.value = null

    try {
      const response = await calendarService.getCalendarByYear(currentYear.value)

      if (response.success) {
        weeks.value = response.data
      } else {
        error.value = response.message || 'Error al obtener el calendario'
      }
    } catch (err) {
      console.error('Error fetching calendar:', err)
      error.value = 'Error de conexión al obtener el calendario'
    } finally {
      loading.value = false
    }
  }

  function navigateYear(direction: 'previous' | 'next') {
    const newYear = direction === 'previous'
      ? currentYear.value - 1
      : currentYear.value + 1

    if (availableYears.value.includes(newYear)) {
      fetchCalendar(newYear)
    }
  }

  async function navigateMonth(direction: 'previous' | 'next') {
    const currentMonthIndex = monthsGroup.value.findIndex(
      month => month.month === selectedMonth.value
    )

    const newIndex = direction === 'previous'
      ? currentMonthIndex - 1
      : currentMonthIndex + 1

    if (newIndex >= 0 && newIndex < monthsGroup.value.length) {
      // Navigate within the same year
      selectedMonth.value = monthsGroup.value[newIndex].month
    } else {
      // Navigate to previous/next year
      const newYear = direction === 'previous'
        ? currentYear.value - 1
        : currentYear.value + 1

      if (availableYears.value.includes(newYear)) {
        // Fetch calendar for new year
        await fetchCalendar(newYear)

        // Set month based on direction
        if (direction === 'previous') {
          // Go to last month of previous year
          selectedMonth.value = monthsGroup.value[monthsGroup.value.length - 1]?.month || ''
        } else {
          // Go to first month of next year
          selectedMonth.value = monthsGroup.value[0]?.month || ''
        }

        // Ensure we're in monthly view
        currentView.value = 'mensual'
      }
    }
  }

  function setView(view: CalendarView) {
    currentView.value = view
    if (view === 'anual') {
      selectedMonth.value = ''
    } else if (view === 'mensual' && !selectedMonth.value && monthsGroup.value.length > 0) {
      // Set the first month as default when switching to monthly view
      selectedMonth.value = monthsGroup.value[0].month
    }
  }

  function selectMonth(month: string) {
    selectedMonth.value = month
    currentView.value = 'mensual'
  }

  function formatDateRange(desde: string, hasta: string): string {
    const fromDate = new Date(desde)
    const toDate = new Date(hasta)

    const formatDay = (date: Date) => date.getDate()
    const formatMonth = (date: Date) => date.toLocaleString('es', { month: 'short' })

    const fromDay = formatDay(fromDate)
    const toDay = formatDay(toDate)
    const fromMonth = formatMonth(fromDate)
    const toMonth = formatMonth(toDate)

    if (fromMonth === toMonth) {
      return `${fromDay} - ${toDay} ${fromMonth}`
    } else {
      return `${fromDay} ${fromMonth} - ${toDay} ${toMonth}`
    }
  }

  return {
    // State
    weeks,
    currentYear,
    currentView,
    selectedMonth,
    loading,
    error,

    // Computed
    monthsGroup,
    filteredMonths,
    availableYears,
    canNavigatePrevious,
    canNavigateNext,

    // Methods
    fetchCalendar,
    navigateYear,
    navigateMonth,
    setView,
    selectMonth,
    formatDateRange
  }
}