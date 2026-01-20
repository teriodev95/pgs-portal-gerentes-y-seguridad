<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarWeek } from '../types'

interface Props {
  week: CalendarWeek
  formatDateRange: (desde: string, hasta: string) => string
}

interface Emits {
  (e: 'click', week: CalendarWeek): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const weekCardClasses = computed(() => [
  props.week.pago_bono
    ? 'border-green-300 hover:border-green-400'
    : 'border-gray-200 hover:border-gray-300'
])

function formatStartDate(date: string): string {
  return new Date(date).toLocaleDateString('es', {
    day: '2-digit'
  })
}

function formatEndDate(date: string): string {
  return new Date(date).toLocaleDateString('es', {
    day: '2-digit'
  })
}

function formatMonths(desde: string, hasta: string): string {
  const fromDate = new Date(desde)
  const toDate = new Date(hasta)

  const fromMonth = fromDate.toLocaleDateString('es', { month: 'short' })
  const toMonth = toDate.toLocaleDateString('es', { month: 'short' })

  if (fromMonth === toMonth) {
    return fromMonth
  } else {
    return `${fromMonth} - ${toMonth}`
  }
}

function handleClick() {
  emit('click', props.week)
}
</script>

<template>
  <div
    class="relative p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer bg-white"
    :class="weekCardClasses"
    @click="handleClick"
  >
    <!-- Week number centered -->
    <div class="text-center mb-2">
      <div class="flex items-center justify-center gap-1 mb-1">
        <span class="text-2xl font-bold text-gray-900">
          {{ week.semana }}
        </span>
        <span v-if="week.pago_bono" class="w-2 h-2 bg-green-500 rounded-full"></span>
      </div>
    </div>

    <!-- Date range compact -->
    <div class="text-center space-y-1">
      <div class="text-xs text-gray-500">
        <div class="flex justify-between items-center">
          <span>{{ formatStartDate(week.desde) }}</span>
          <span class="text-gray-400">→</span>
          <span>{{ formatEndDate(week.hasta) }}</span>
        </div>
      </div>
      <div class="text-xs text-gray-400">
        {{ formatMonths(week.desde, week.hasta) }}
      </div>
    </div>
  </div>
</template>