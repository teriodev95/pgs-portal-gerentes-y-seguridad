<script setup lang="ts">
import { HOUR_ROW_HEIGHT } from '../constants'
import { formatHourLabel } from '../utils/time'

// Sin spinner: el riel se dibuja completo y sólo faltan los bloques.
const HOURS = [7, 8, 9, 10, 11]
const GHOST_HOURS = [8, 10]

const rowHeight = HOUR_ROW_HEIGHT - 8
</script>

<template>
  <div role="status" aria-label="Cargando agenda">
    <div v-for="hour in HOURS" :key="`skeleton-${hour}`" class="flex gap-2">
      <span class="w-14 shrink-0 pt-1 text-right text-xs text-gray-600">
        {{ formatHourLabel(hour) }}
      </span>
      <div class="flex-1 border-l border-gray-200 pb-2 pl-3">
        <div
          v-if="GHOST_HOURS.includes(hour)"
          class="animate-pulse rounded-lg border border-gray-200 bg-gray-100"
          :style="{ height: `${rowHeight * 2}px` }"
        />
        <div
          v-else-if="hour === HOURS[0]"
          class="animate-pulse rounded-lg border border-gray-200 bg-gray-100"
          :style="{ height: `${rowHeight}px` }"
        />
        <div v-else :style="{ height: `${rowHeight}px` }" />
      </div>
    </div>
    <span class="sr-only">Cargando agenda…</span>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
}
</style>
