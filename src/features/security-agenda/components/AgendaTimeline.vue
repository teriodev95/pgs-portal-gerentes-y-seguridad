<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, Plus } from 'lucide-vue-next'
import { HOUR_ROW_HEIGHT } from '../constants'
import { formatHourLabel, formatTime, toHHMM } from '../utils/time'
import type { TimelineRow } from '../composables/useAgendaTimeline'
import type { AgendaActivity } from '../types'

// Components
import AgendaActivityBlock from './AgendaActivityBlock.vue'

interface Props {
  rows: TimelineRow[]
  /** Vista pública y agenda de otro auditor sin permiso de edición. */
  readonly?: boolean
}

withDefaults(defineProps<Props>(), { readonly: false })

defineEmits<{
  (e: 'select-gap', hour: number): void
  (e: 'select-activity', activity: AgendaActivity): void
  (e: 'expand', position: 'leading' | 'trailing'): void
}>()

// La vista ancla el scroll inicial aquí (línea del ahora a ~1/3 de pantalla).
// Ref de función porque la fila vive dentro del v-for (un ref normal daría array).
const nowElement = ref<HTMLElement>()

function setNowElement(el: unknown) {
  nowElement.value = (el as HTMLElement) || undefined
}

defineExpose({ nowElement })

const gapHeight = HOUR_ROW_HEIGHT - 8
</script>

<template>
  <div class="agenda-timeline">
    <template v-for="row in rows" :key="row.key">
      <!-- Horas vacías del inicio o del final, colapsadas en una línea -->
      <button
        v-if="row.kind === 'collapsed'"
        type="button"
        class="flex w-full items-center gap-2 py-1 text-left"
        @click="$emit('expand', row.position)"
      >
        <span class="w-14 shrink-0 text-right text-xs text-gray-500">
          {{ formatHourLabel(row.fromHour) }}
        </span>
        <span
          class="flex flex-1 items-center gap-1.5 border-l border-gray-200 py-1 pl-3 text-xs text-gray-600"
        >
          <ChevronDown class="size-3.5" :stroke-width="2" />
          Mostrar {{ formatHourLabel(row.fromHour) }} – {{ formatHourLabel(row.toHour) }}
        </span>
      </button>

      <!-- Línea del ahora: sólo cuando la fecha vista es hoy -->
      <div v-else-if="row.kind === 'now'" :ref="setNowElement" class="flex items-center gap-2 py-1">
        <span class="w-14 shrink-0 text-right text-xs font-semibold text-blue-700">
          {{ formatTime(toHHMM(row.startMinutes)) }}
        </span>
        <span class="relative flex-1">
          <span class="absolute -left-1 -top-[3px] size-[7px] rounded-full bg-blue-600" />
          <span class="block h-px bg-blue-600" />
        </span>
      </div>

      <!-- Hueco tocable: precarga la hora en la hoja de alta -->
      <div v-else-if="row.kind === 'gap'" class="flex gap-2">
        <span class="w-14 shrink-0 pt-1 text-right text-xs text-gray-500">
          {{ formatHourLabel(row.hour) }}
        </span>
        <div class="flex-1 border-l border-gray-200 pb-2 pl-3">
          <button
            v-if="!readonly"
            type="button"
            class="agenda-gap flex w-full items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 text-xs text-gray-600 active:bg-gray-100"
            :style="{ height: `${gapHeight}px` }"
            @click="$emit('select-gap', row.hour)"
          >
            <Plus class="size-4" :stroke-width="2" />
            Agregar a las {{ formatHourLabel(row.hour) }}
          </button>
          <div v-else :style="{ height: `${gapHeight}px` }" />
        </div>
      </div>

      <!-- Actividad -->
      <div v-else class="flex gap-2">
        <span class="w-14 shrink-0 pt-1 text-right text-xs font-medium text-gray-600">
          {{ formatTime(row.activity.horaInicio) }}
        </span>
        <div class="flex-1 border-l border-gray-200 pb-2 pl-3">
          <AgendaActivityBlock
            :activity="row.activity"
            :min-height="row.minHeight"
            :is-past="row.isPast"
            :readonly="readonly"
            @select="$emit('select-activity', $event)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.agenda-gap {
  transition: background-color 150ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .agenda-gap {
    transition: none;
  }
}
</style>
