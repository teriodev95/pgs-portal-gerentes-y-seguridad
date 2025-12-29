<template>
  <div
    class="relative p-6 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer bg-white"
    :class="weekCardClasses"
    @click="handleClick"
  >
    <!-- Week number (large) -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex flex-col">
        <span class="text-4xl font-bold text-gray-900 mb-1">
          {{ week.semana }}
        </span>
        <span class="text-sm text-gray-500 font-medium">
          semana
        </span>
      </div>
      <!-- Bonus indicator -->
      <div v-if="week.pago_bono" class="flex items-center justify-center">
        <span class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
          </svg>
          Pago de Bono
        </span>
      </div>
    </div>

    <!-- Date range section -->
    <div class="space-y-3">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">Inicio</span>
        <span class="font-medium text-gray-900">{{ formatStartDate(week.desde) }}</span>
      </div>
      <div class="flex items-center justify-center text-gray-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </svg>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">Fin</span>
        <span class="font-medium text-gray-900">{{ formatEndDate(week.hasta) }}</span>
      </div>
    </div>

    <!-- Date range summary -->
    <div class="mt-4 pt-4 border-t border-gray-100">
      <p class="text-sm text-gray-600 text-center">
        {{ formatDateRange(week.desde, week.hasta) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarWeek } from '../types'

interface Props {
  week: CalendarWeek
  formatDateRange: (desde: string, hasta: string) => string
}

interface Emits {
  click: [week: CalendarWeek]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const weekCardClasses = computed(() => [
  props.week.pago_bono
    ? 'border-green-300 shadow-green-100/50 hover:border-green-400 hover:shadow-green-200/50'
    : 'border-gray-200 hover:border-gray-300 hover:shadow-gray-100'
])

function formatStartDate(date: string): string {
  return new Date(date).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short'
  })
}

function formatEndDate(date: string): string {
  return new Date(date).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short'
  })
}

function handleClick() {
  emit('click', props.week)
}
</script>