<template>
  <div
    class="relative p-4 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer bg-white"
    :class="weekCardClasses"
    @click="handleClick"
  >
    <!-- Week number and bonus indicator -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex flex-col">
        <span class="text-3xl font-bold text-gray-900">
          {{ week.semana }}
        </span>
        <span class="text-xs text-gray-500 font-medium">
          semana
        </span>
      </div>
      <!-- Bonus indicator -->
      <div v-if="week.pago_bono" class="flex items-center justify-center">
        <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Pago de Bono
        </span>
      </div>
    </div>


    <!-- Date range summary -->
    <div class="mt-3 pt-3 border-t border-gray-100">
      <p class="text-xs text-gray-500 text-center">
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
  (e: 'click', week: CalendarWeek): void
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