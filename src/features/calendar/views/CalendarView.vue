<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCalendar } from '../composables'
import type { CalendarWeek } from '../types'
import CalendarNavigation from '../components/CalendarNavigation.vue'
import MonthCard from '../components/MonthCard.vue'
import MonthlyWeekCard from '../components/MonthlyWeekCard.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import { ROUTE_NAME } from '@/router'
import SectionContainer from '@/shared/components/SectionContainer.vue'

const router = useRouter()

const {
  // State
  currentYear,
  currentView,
  selectedMonth,
  loading,

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

function handleBack() {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}

onMounted(() => {
  fetchCalendar()
})
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Calendario"
      :show-back-button="true"
      @back="handleBack"
    />

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
      <EmptyCT
        v-else
        message="No hay datos disponibles"
        :description="`No se encontraron semanas para el año ${currentYear}`"
      />
    </SectionContainer>
  </MainCT>
</template>