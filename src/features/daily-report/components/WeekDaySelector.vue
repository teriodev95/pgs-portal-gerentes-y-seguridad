<script setup lang="ts">
import { useWeekDaySelector, type BusinessDay } from '../composables/useWeekDaySelector'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const {
  days,
  selectedWeek,
  selectedDayKey,
  canGoNext,
  isDaySelectable,
  nextWeek,
  prevWeek,
  selectDay,
} = useWeekDaySelector()

const emit = defineEmits<{
  'update:day': [day: BusinessDay]
}>()

function handleSelectDay(day: BusinessDay): void {
  if (!isDaySelectable(day)) return
  selectDay(day)
  emit('update:day', day)
}
</script>

<template>
  <div class="space-y-5">
    <!-- Week Selector -->
    <div class="space-y-2">
      <span class="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 pl-1">
        Semana
      </span>
      <div class="flex items-center gap-2">
        <button
          @click="prevWeek"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-150 active:scale-95 hover:border-slate-300 hover:bg-slate-50"
        >
          <ChevronLeft :size="18" :stroke-width="2.5" />
        </button>

        <div class="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white py-3">
          <span class="text-base font-semibold text-slate-800 tabular-nums">
            Semana {{ selectedWeek }}
          </span>
        </div>

        <button
          @click="nextWeek"
          :disabled="!canGoNext"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-150 active:scale-95"
          :class="canGoNext
            ? 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
            : 'border-slate-100 bg-slate-50 text-slate-200 cursor-not-allowed'"
        >
          <ChevronRight :size="18" :stroke-width="2.5" />
        </button>
      </div>
    </div>

    <!-- Day Selector -->
    <div class="space-y-2">
      <span class="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 pl-1">
        Día
      </span>
      <div class="grid grid-cols-7 gap-1.5">
        <button
          v-for="day in days"
          :key="day.key"
          @click="handleSelectDay(day)"
          :disabled="!isDaySelectable(day)"
          class="relative flex h-12 items-center justify-center rounded-2xl text-[13px] font-semibold transition-all duration-200"
          :class="[
            selectedDayKey === day.key
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
              : isDaySelectable(day)
                ? 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 active:scale-95'
                : 'bg-slate-50 text-slate-200 cursor-not-allowed'
          ]"
        >
          {{ day.shortLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
