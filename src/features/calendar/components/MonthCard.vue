<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Month header -->
    <div
      class="px-6 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
      @click="handleMonthClick"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <h2 class="text-lg font-semibold text-gray-900">
            {{ monthGroup.month }}
          </h2>
        </div>
        <span class="text-sm text-gray-500">
          {{ monthGroup.weekCount }} sem
        </span>
      </div>
    </div>

    <!-- Weeks grid -->
    <div class="p-4 space-y-3">
      <div
        class="grid"
        :class="currentView === 'anual'
          ? 'grid-cols-2 gap-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'"
      >
        <WeekCard
          v-for="week in monthGroup.weeks"
          :key="week.id"
          :week="week"
          :format-date-range="formatDateRange"
          @click="handleWeekClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarWeek, MonthGroup, CalendarView } from '../types'
import WeekCard from './WeekCard.vue'

interface Props {
  monthGroup: MonthGroup
  currentView: CalendarView
  formatDateRange: (desde: string, hasta: string) => string
}

interface Emits {
  selectMonth: [month: string]
  weekClick: [week: CalendarWeek]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleMonthClick() {
  if (props.currentView === 'anual') {
    emit('selectMonth', props.monthGroup.month)
  }
}

function handleWeekClick(week: CalendarWeek) {
  emit('weekClick', week)
}
</script>