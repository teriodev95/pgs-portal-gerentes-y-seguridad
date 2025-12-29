<template>
  <div
    class="relative p-4 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer"
    :class="weekCardClasses"
    @click="handleClick"
  >
    <!-- Week number and bonus indicator -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="text-lg font-semibold text-gray-900">
          S{{ week.semana }}
        </span>
        <span
          v-if="week.pago_bono"
          class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
        >
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
          </svg>
          Bono
        </span>
      </div>
    </div>

    <!-- Date range -->
    <p class="text-sm text-gray-600">
      {{ formatDateRange(week.desde, week.hasta) }}
    </p>
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
    ? 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100'
    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
])

function handleClick() {
  emit('click', props.week)
}
</script>