<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_STYLE } from '../constants'
import { formatTime } from '../utils/time'
import type { AgendaActivity } from '../types'

// Components
import AgendaPriorityTag from './AgendaPriorityTag.vue'
import AgendaStatusChip from './AgendaStatusChip.vue'

interface Props {
  activity: AgendaActivity
  minHeight: number
  isPast?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPast: false,
  readonly: false
})

defineEmits<{ (e: 'select', activity: AgendaActivity): void }>()

// Pasado: se apaga el fondo y el borde, nunca el texto.
const blockClass = computed(() => {
  const style = STATUS_STYLE[props.activity.status]
  return props.isPast ? style.blockPast : style.block
})

const horario = computed(
  () => `${formatTime(props.activity.horaInicio)} – ${formatTime(props.activity.horaFin)}`
)

const lugar = computed(() =>
  [props.activity.gerencia, props.activity.agencia].filter(Boolean).join(' · ')
)
</script>

<template>
  <component
    :is="readonly ? 'div' : 'button'"
    :type="readonly ? undefined : 'button'"
    class="agenda-block w-full rounded-lg border p-3 text-left"
    :class="blockClass"
    :style="{ minHeight: `${minHeight}px` }"
    @click="readonly ? undefined : $emit('select', activity)"
  >
    <div class="flex items-start justify-between gap-2">
      <p class="text-sm font-semibold leading-snug">{{ activity.tipoNombre }}</p>
      <AgendaStatusChip :status="activity.status" class="shrink-0" />
    </div>

    <p v-if="activity.detalle" class="mt-1 line-clamp-2 text-xs leading-snug">
      {{ activity.detalle }}
    </p>

    <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span class="font-medium">{{ horario }}</span>
      <AgendaPriorityTag :priority="activity.prioridad" />
      <span v-if="lugar" class="truncate">{{ lugar }}</span>
    </div>

    <p v-if="activity.comentario" class="mt-2 text-xs italic leading-snug">
      {{ activity.comentario }}
    </p>
  </component>
</template>

<style scoped>
.agenda-block {
  transition: background-color 200ms ease, border-color 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .agenda-block {
    transition: none;
  }
}
</style>
