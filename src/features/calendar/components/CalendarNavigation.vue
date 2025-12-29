<template>
  <div class="space-y-4 mb-6">
    <!-- View toggle - always at top -->
    <div class="flex justify-end">
      <div class="flex border border-gray-300 rounded-lg overflow-hidden">
        <button @click="$emit('setView', 'anual')" class="px-4 py-2 text-sm font-medium transition-colors" :class="currentView === 'anual'
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50'">
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Anual
        </button>
        <button @click="$emit('setView', 'mensual')" class="px-4 py-2 text-sm font-medium transition-colors" :class="currentView === 'mensual'
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50'">
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Mensual
        </button>
      </div>
    </div>

    <!-- Year/Month navigation -->
    <div class="flex justify-between items-center gap-4">
      <button @click="handlePreviousClick" :disabled="!canNavigatePrevious"
        class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :class="{ 'hover:border-gray-400': canNavigatePrevious }">
        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Annual view: show year -->
      <h1 v-if="currentView === 'anual'" class="text-sm font-bold text-gray-900">
        {{ currentYear }}
      </h1>

      <!-- Monthly view: show month, year and week count -->
      <div v-else class="flex items-center gap-3">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h1 class="text-sm font-bold text-gray-900">{{ selectedMonth }} {{ currentYear }}</h1>
        <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {{ weekCount }} semanas
        </span>
      </div>

      <button @click="handleNextClick" :disabled="!canNavigateNext"
        class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :class="{ 'hover:border-gray-400': canNavigateNext }">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
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

function handlePreviousClick() {
  if (props.currentView === 'anual') {
    emit('navigateYear', 'previous')
  } else {
    emit('navigateMonth', 'previous')
  }
}

function handleNextClick() {
  if (props.currentView === 'anual') {
    emit('navigateYear', 'next')
  } else {
    emit('navigateMonth', 'next')
  }
}
</script>