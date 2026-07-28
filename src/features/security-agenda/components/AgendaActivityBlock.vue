<script setup lang="ts">
import { computed } from 'vue'
import { MapPin, MapPinCheck } from 'lucide-vue-next'
import { STATUS_STYLE, VISIT_ACTIVITY_TYPE } from '../constants'
import { formatTime, toMinutes } from '../utils/time'
import { parseVisitDetail } from '../utils/visit'
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
  /** Sólo en mi agenda: la visita se registra con mi usuario y mi ubicación. */
  canRegisterVisit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPast: false,
  readonly: false,
  canRegisterVisit: false
})

defineEmits<{
  (e: 'select', activity: AgendaTimelineActivity): void
  (e: 'register-visit', activity: AgendaTimelineActivity): void
}>()

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

const visita = computed(() => props.activity.visita ?? null)

/**
 * Sin préstamo en el detalle no hay nada que mandar a FAX, y media hora no da
 * el alto de un botón tocable: en esos dos casos la acción vive en la hoja de
 * la actividad, que siempre la ofrece.
 */
const puedeRegistrar = computed(
  () =>
    props.canRegisterVisit &&
    !props.readonly &&
    props.activity.tipo === VISIT_ACTIVITY_TYPE &&
    !visita.value &&
    duracion.value > 30 &&
    parseVisitDetail(props.activity.detalle) !== null
)

// El alto lo manda la duración, así que lo que no cabe no se pinta: media hora
// da para el título, una hora suma una línea más y de hora y media en adelante
// cabe todo. La evidencia de la visita y el botón de registrarla desplazan al
// pie, que es lo primero prescindible: la hora ya está en el riel.
const soloTitulo = computed(() => duracion.value <= 30)
const cabeTodo = computed(() => duracion.value >= 90)
const cabeDetalle = computed(() => !soloTitulo.value && (!puedeRegistrar.value || cabeTodo.value))
const cabeEvidencia = computed(() => !soloTitulo.value && visita.value !== null)
const cabePie = computed(
  () => !soloTitulo.value && !puedeRegistrar.value && (!cabeEvidencia.value || cabeTodo.value)
)
const cabeComentario = computed(
  () => cabeTodo.value && !puedeRegistrar.value && !cabeEvidencia.value
)

const detalleClamp = computed(() => (cabeTodo.value ? 'line-clamp-2' : 'line-clamp-1'))

const lugar = computed(() =>
  [props.activity.gerencia, props.activity.agencia].filter(Boolean).join(' · ')
)
</script>

<template>
  <!-- Contenedor con el alto exacto: dentro, la superficie que abre la
       actividad y —cuando cabe— la acción de registrar, que es otro botón. -->
  <div
    class="agenda-block flex w-full flex-col overflow-hidden rounded-lg border"
    :class="[blockClass, soloTitulo ? 'p-2' : 'p-3']"
    :style="{ height: `${height}px` }"
  >
    <component
      :is="readonly ? 'div' : 'button'"
      :type="readonly ? undefined : 'button'"
      class="min-h-0 flex-1 text-left"
      @click="readonly ? undefined : $emit('select', activity)"
    >
      <div class="flex items-start justify-between gap-2">
        <p class="flex min-w-0 items-center gap-1 text-sm font-semibold leading-snug">
          <MapPinCheck
            v-if="visita"
            class="size-3.5 shrink-0"
            :stroke-width="2"
            aria-label="Visita registrada"
          />
          <span class="truncate">{{ activity.tipoNombre }}</span>
        </p>
        <AgendaStatusChip :status="activity.status" class="shrink-0" />
      </div>

      <template v-if="!soloTitulo">
        <p v-if="cabeDetalle && activity.detalle" class="mt-1 text-xs leading-snug" :class="detalleClamp">
          {{ activity.detalle }}
        </p>

        <!-- Evidencia: qué se encontró en la visita. Nunca coordenadas. -->
        <p v-if="cabeEvidencia && visita" class="mt-1.5 truncate text-xs font-medium">
          Visita registrada · {{ visita.status }}
        </p>

        <!-- Una sola línea: si envolviera, la segunda quedaría cortada por el alto. -->
        <div v-if="cabePie" class="mt-2 flex items-center gap-x-3 text-xs">
          <span class="shrink-0 font-medium">{{ horario }}</span>
          <AgendaPriorityTag :priority="activity.prioridad" class="shrink-0" />
          <span v-if="lugar" class="min-w-0 truncate">{{ lugar }}</span>
        </div>

        <p v-if="cabeComentario && activity.comentario" class="mt-2 text-xs italic leading-snug">
          {{ activity.comentario }}
        </p>
      </template>
    </component>

    <button
      v-if="puedeRegistrar"
      type="button"
      class="mt-1.5 flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-blue-700 bg-white text-sm font-medium text-blue-800"
      @click="$emit('register-visit', activity)"
    >
      <MapPin class="size-4" :stroke-width="2" aria-hidden="true" />
      Registrar visita
    </button>
  </div>
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
