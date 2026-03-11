<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarView } from '../types'

interface Props {
  currentYear: number
  currentView: CalendarView
  canNavigatePrevious: boolean
  canNavigateNext: boolean
  selectedMonth: string
  weekCount?: number
}

interface Emits {
  (e: 'navigateYear', direction: 'previous' | 'next'): void
  (e: 'navigateMonth', direction: 'previous' | 'next'): void
  (e: 'setView', view: CalendarView): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isAnnualView = computed(() => props.currentView === 'anual')

const viewButtons = [
  {
    view: 'anual' as CalendarView,
    label: 'Anual',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16'
  },
  {
    view: 'mensual' as CalendarView,
    label: 'Mensual',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  }
] as const

function handlePreviousClick() {
  if (isAnnualView.value) {
    emit('navigateYear', 'previous')
  } else {
    emit('navigateMonth', 'previous')
  }
}

function handleNextClick() {
  if (isAnnualView.value) {
    emit('navigateYear', 'next')
  } else {
    emit('navigateMonth', 'next')
  }
}

function getViewButtonClass(view: CalendarView) {
  return props.currentView === view
    ? 'bg-blue-600 text-white'
    : 'bg-white text-gray-700 hover:bg-gray-50'
}

const navigationButtonBaseClass = 'p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
</script>

<template>
  <div class="space-y-4 mb-6">
    <!-- View toggle - always at top -->
    <div class="flex justify-end">
      <div class="flex border border-gray-300 rounded-lg overflow-hidden">
        <button
          v-for="button in viewButtons"
          :key="button.view"
          @click="$emit('setView', button.view)"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="getViewButtonClass(button.view)">
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="button.icon" />
          </svg>
          {{ button.label }}
        </button>
      </div>
    </div>

    <!-- Year/Month navigation -->
    <div class="flex justify-between items-center gap-4">
      <button
        @click="handlePreviousClick"
        :disabled="!canNavigatePrevious"
        :class="[navigationButtonBaseClass, { 'hover:border-gray-400': canNavigatePrevious }]">
        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Annual view: show year -->
      <h1 v-if="isAnnualView" class="text-sm font-bold text-gray-900">
        {{ currentYear }}
      </h1>

      <!-- Monthly view: show month, year and week count -->
      <div v-else class="flex items-center gap-3">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h1 class="text-sm font-bold text-gray-900">{{ selectedMonth }} {{ currentYear }}</h1>
        <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {{ weekCount }} semanas
        </span>
      </div>

      <button
        @click="handleNextClick"
        :disabled="!canNavigateNext"
        :class="[navigationButtonBaseClass, { 'hover:border-gray-400': canNavigateNext }]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>