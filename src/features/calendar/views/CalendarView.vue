<template>
  <main class="min-h-screen bg-slate-100 pb-[6rem]">
    <div class="block p-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop label="Calendario" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
      </div>
    </div>

    <SectionContainer>
      <!-- Navigation -->
      <CalendarNavigation
        :current-year="currentYear"
        :current-view="currentView"
        :can-navigate-previous="canNavigatePrevious"
        :can-navigate-next="canNavigateNext"
        :selected-month="selectedMonth"
        :week-count="currentMonthWeekCount"
        @navigate-year="navigateYear"
        @navigate-month="navigateMonth"
        @set-view="setView"
      />
  
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="flex items-center gap-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="text-gray-600">Cargando calendario...</span>
        </div>
      </div>
  
      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>
  
      <!-- Calendar content -->
      <div v-else-if="filteredMonths.length > 0">
        <!-- Annual view -->
        <div
          v-if="currentView === 'anual'"
          class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <MonthCard
            v-for="monthGroup in filteredMonths"
            :key="monthGroup.month"
            :month-group="monthGroup"
            :current-view="currentView"
            :format-date-range="formatDateRange"
            @select-month="selectMonth"
            @week-click="handleWeekClick"
          />
        </div>
  
        <!-- Monthly view -->
        <div v-else>
          <div
            v-for="monthGroup in filteredMonths"
            :key="monthGroup.month"
          >
            <!-- Weeks grid for monthly view -->
            <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <MonthlyWeekCard
                v-for="week in monthGroup.weeks"
                :key="week.id"
                :week="week"
                :format-date-range="formatDateRange"
                @click="handleWeekClick"
              />
            </div>
          </div>
        </div>
      </div>
  
      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
        <p class="text-gray-600">No se encontraron semanas para el a�o {{ currentYear }}</p>
      </div>
    </SectionContainer>

  </main>

</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useCalendar } from '../composables'
import type { CalendarWeek } from '../types'
import CalendarNavigation from '../components/CalendarNavigation.vue'
import MonthCard from '../components/MonthCard.vue'
import MonthlyWeekCard from '../components/MonthlyWeekCard.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import { ROUTE_NAME } from '@/router'
import SectionContainer from '@/shared/components/SectionContainer.vue'

const {
  // State
  currentYear,
  currentView,
  selectedMonth,
  loading,
  error,

  // Computed
  monthsGroup,
  filteredMonths,
  canNavigatePrevious,
  canNavigateNext,

  // Methods
  fetchCalendar,
  navigateYear,
  navigateMonth,
  setView,
  selectMonth,
  formatDateRange
} = useCalendar()

// Computed property for current month's week count
const currentMonthWeekCount = computed(() => {
  if (!selectedMonth.value) return 0
  const month = monthsGroup.value.find(m => m.month === selectedMonth.value)
  return month?.weekCount || 0
})

function handleWeekClick(week: CalendarWeek) {
  console.log('Week clicked:', week)
}

onMounted(() => {
  fetchCalendar()
})
</script>