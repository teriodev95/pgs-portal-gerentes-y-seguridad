<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_STYLE } from '../constants'
import { formatTime, toMinutes } from '../utils/time'
import type { AgendaTimelineActivity } from '../types'

// Components
import AgendaPriorityTag from './AgendaPriorityTag.vue'
import AgendaStatusChip from './AgendaStatusChip.vue'

interface Props {
  activity: AgendaTimelineActivity
  /** Alto exacto según la duración: el contenido se ajusta a él, no al revés. */
  height: number
  isPast?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPast: false,
  readonly: false
})

defineEmits<{ (e: 'select', activity: AgendaTimelineActivity): void }>()

// Pasado: se apaga el fondo y el borde, nunca el texto.
const blockClass = computed(() => {
  const style = STATUS_STYLE[props.activity.status]
  return props.isPast ? style.blockPast : style.block
})

const horario = computed(
  () => `${formatTime(props.activity.horaInicio)} – ${formatTime(props.activity.horaFin)}`
)

const duracion = computed(
  () => toMinutes(props.activity.horaFin) - toMinutes(props.activity.horaInicio)
)

// El alto lo manda la duración, así que lo que no cabe no se pinta: media hora
// da para el título, una hora suma el pie y el detalle en una línea, y de hora y
// media en adelante cabe todo.
const soloTitulo = computed(() => duracion.value <= 30)
const detalleClamp = computed(() => (duracion.value >= 90 ? 'line-clamp-2' : 'line-clamp-1'))
const cabeComentario = computed(() => duracion.value >= 90)

const lugar = computed(() =>
  [props.activity.gerencia, props.activity.agencia].filter(Boolean).join(' · ')
)
</script>

<template>
  <component
    :is="readonly ? 'div' : 'button'"
    :type="readonly ? undefined : 'button'"
    class="agenda-block w-full overflow-hidden rounded-lg border text-left"
    :class="[blockClass, soloTitulo ? 'p-2' : 'p-3']"
    :style="{ height: `${height}px` }"
    @click="readonly ? undefined : $emit('select', activity)"
  >
    <div class="flex items-start justify-between gap-2">
      <p class="truncate text-sm font-semibold leading-snug">{{ activity.tipoNombre }}</p>
      <AgendaStatusChip :status="activity.status" class="shrink-0" />
    </div>

    <template v-if="!soloTitulo">
      <p v-if="activity.detalle" class="mt-1 text-xs leading-snug" :class="detalleClamp">
        {{ activity.detalle }}
      </p>

      <!-- Una sola línea: si envolviera, la segunda quedaría cortada por el alto. -->
      <div class="mt-2 flex items-center gap-x-3 text-xs">
        <span class="shrink-0 font-medium">{{ horario }}</span>
        <AgendaPriorityTag :priority="activity.prioridad" class="shrink-0" />
        <span v-if="lugar" class="min-w-0 truncate">{{ lugar }}</span>
      </div>

      <p v-if="cabeComentario && activity.comentario" class="mt-2 text-xs italic leading-snug">
        {{ activity.comentario }}
      </p>
    </template>
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
