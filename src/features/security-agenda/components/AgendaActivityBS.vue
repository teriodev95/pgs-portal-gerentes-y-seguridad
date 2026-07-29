<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Check, ChevronDown, MapPin, MapPinCheck } from 'lucide-vue-next'
import {
  DAY_END_HOUR,
  DEFAULT_DURATION_MINUTES,
  DETAIL_MAX_LENGTH,
  DURATION_OPTIONS,
  PRIORITY_OPTIONS,
  PRIORITY_STYLE,
  START_HOURS,
  START_MINUTES,
  STATUS_STYLE,
  VISIT_ACTIVITY_TYPE
} from '../constants'
import {
  formatDuration,
  formatHourLabel,
  formatTime,
  formatTimestampTime,
  toHHMM,
  toMinutes
} from '../utils/time'
import { parseVisitDetail } from '../utils/visit'
import type {
  AgendaActivity,
  AgendaActivityDefaults,
  AgendaActivityPayload,
  AgendaActivityType,
  AgendaPriority,
  AgendaScope
} from '../types'

// Components
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'

type ActivityFormPayload = Omit<AgendaActivityPayload, 'fecha' | 'auditorId'>

interface Props {
  open: boolean
  /** Con valor: edición. Sin valor: alta con la hora del hueco tocado. */
  activity: AgendaActivity | null
  defaultHoraInicio: string
  activityTypes: AgendaActivityType[]
  scope: AgendaScope
  /** Precarga del alta: sólo aplica cuando no hay actividad que editar. */
  defaults?: AgendaActivityDefaults | null
  /**
   * Actividades ya capturadas ese día, para no ofrecer una duración que se
   * encime con otra. Vacío es válido y no rompe nada: ahí las duraciones sólo
   * se limitan por el fin de la jornada y el traslape lo rechaza el backend.
   */
  dayActivities?: AgendaActivity[]
  /** Sólo en mi agenda: la visita se registra con mi usuario y mi ubicación. */
  canRegisterVisit?: boolean
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaults: null,
  dayActivities: () => [],
  canRegisterVisit: false,
  saving: false
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: ActivityFormPayload): void
  (e: 'delete', id: number): void
  (e: 'register-visit', activity: AgendaActivity): void
}>()

const tipo = ref('')
const detalle = ref('')
const horaInicio = ref('')
const duracion = ref(DEFAULT_DURATION_MINUTES)
const prioridad = ref<AgendaPriority>('media')
const gerencia = ref('')
const agencia = ref('')
const formError = ref('')
const confirmingDelete = ref(false)

/** Las siete actividades se despliegan en su sitio; abiertas de golpe se comen la hoja. */
const tipoAbierto = ref(false)
const tipoTrigger = ref<HTMLButtonElement>()

const tipoNombre = computed(
  () =>
    props.activityTypes.find((item) => item.clave === tipo.value)?.nombre ??
    'Selecciona una actividad'
)

/**
 * Se elige y se colapsa, pero sólo con el dedo o el ratón: `detail` vale 0
 * cuando el clic lo sintetiza el teclado, y ahí cerrar cortaría el recorrido con
 * las flechas a media lista. Al colapsar, el foco vuelve al renglón que abrió.
 */
function elegirTipo(event: MouseEvent) {
  if (event.detail === 0) return

  tipoAbierto.value = false
  tipoTrigger.value?.focus()
}

/**
 * `horaInicio` sigue siendo la verdad; hora y minuto son dos vistas de ella.
 * Escribir por separado evita el estado duplicado que habría que resincronizar.
 */
const horaSeleccionada = computed(() => Math.floor(toMinutes(horaInicio.value) / 60))
const minutoSeleccionado = computed(() => toMinutes(horaInicio.value) % 60)

function setHora(hour: number) {
  horaInicio.value = toHHMM(hour * 60 + minutoSeleccionado.value)
}

function setMinuto(minute: number) {
  horaInicio.value = toHHMM(horaSeleccionada.value * 60 + minute)
}

const horaRail = ref<HTMLElement>()

/** La hora elegida puede haber quedado fuera de la vista; al abrir se trae al centro. */
async function centrarHora() {
  await nextTick()
  requestAnimationFrame(() => {
    const rail = horaRail.value
    const chip = rail?.querySelector<HTMLElement>('[data-selected="true"]')
    if (!rail || !chip) return

    rail.scrollLeft = chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2
  })
}

// La hoja se monta al abrirse, así que el riel aparece después del `watch` de
// `open`: centrar también cuando existe cubre las dos entradas.
watch(horaRail, (rail) => {
  if (rail) centrarHora()
})

/** El contrato sigue siendo `horaInicio`/`horaFin`; la duración sólo es cómo se captura. */
const horaFin = computed(() => toHHMM(toMinutes(horaInicio.value) + duracion.value))

/** Lo ya ocupado ese día. Editando, la propia actividad no se estorba a sí misma. */
const ocupado = computed(() =>
  props.dayActivities
    .filter((item) => item.id !== props.activity?.id)
    .map((item) => [toMinutes(item.horaInicio), toMinutes(item.horaFin)])
)

/** Cabe si termina dentro de la jornada y no pisa otra actividad. */
function cabe(minutes: number): boolean {
  const inicio = toMinutes(horaInicio.value)
  const fin = inicio + minutes
  if (fin > DAY_END_HOUR * 60) return false
  return !ocupado.value.some(([desde, hasta]) => inicio < hasta && fin > desde)
}

const duraciones = computed(() =>
  DURATION_OPTIONS.map((minutes) => ({
    minutes,
    label: formatDuration(minutes),
    disabled: !cabe(minutes)
  }))
)

/** A las 21:30 con ese bloque ya ocupado no queda ninguna: hay que decirlo. */
const sinDuracion = computed(() => duraciones.value.every((option) => option.disabled))

const agencias = computed(
  () => props.scope.gerencias.find((item) => item.gerenciaId === gerencia.value)?.agencias ?? []
)

/**
 * Gerencia y agencia se despliegan como la actividad, y por lo mismo: `GERC001`
 * y `GERC002` sólo se distinguen en el último dígito, y en vertical y alineados
 * a la izquierda se comparan de un vistazo.
 *
 * Los dos renglones cerrados comparten línea, pero la lista abierta ocupa el
 * ancho completo: a media anchura los códigos quedaban apretados. Como sólo se
 * abre una a la vez, basta un panel y no hay dos listas casi idénticas.
 */
type CampoLugar = 'gerencia' | 'agencia'

const lugarAbierto = ref<CampoLugar | null>(null)
const gerenciaTrigger = ref<HTMLButtonElement>()
const agenciaTrigger = ref<HTMLButtonElement>()

/**
 * Cada opción viaja con el campo al que pertenece, congelado en el render.
 * Es a propósito: al tocar la fila, el navegador dispara el clic de la etiqueta
 * antes de marcar el radio, así que para cuando llega el `change` el panel ya se
 * cerró. Si el destino se dedujera entonces de `lugarAbierto`, una gerencia
 * acabaría escribiéndose en la agencia.
 *
 * El vacío va primero: limpiar es la opción de arriba, no la que hay que buscar.
 */
const opcionesLugar = computed(() => {
  const campo = lugarAbierto.value
  const valores =
    campo === 'gerencia'
      ? ['', ...props.scope.gerencias.map((item) => item.gerenciaId)]
      : ['', ...agencias.value]

  return valores.map((valor) => ({ campo, valor }))
})

/** Sólo para pintar: escribir pasa por `fijarLugar`. */
const valorLugar = computed(() =>
  lugarAbierto.value === 'gerencia' ? gerencia.value : agencia.value
)

function fijarLugar(campo: CampoLugar | null, valor: string) {
  if (campo === 'gerencia') gerencia.value = valor
  else if (campo === 'agencia') agencia.value = valor
}

function alternarLugar(campo: CampoLugar) {
  lugarAbierto.value = lugarAbierto.value === campo ? null : campo
}

/**
 * Mismo trato que la actividad: colapsa con el dedo, no con las flechas. El
 * `lugarAbierto` vacío corta la segunda pasada, la del clic que el navegador
 * sintetiza sobre el radio y vuelve a subir hasta la etiqueta.
 */
function elegirLugar(event: MouseEvent) {
  if (event.detail === 0 || !lugarAbierto.value) return

  const trigger = lugarAbierto.value === 'gerencia' ? gerenciaTrigger.value : agenciaTrigger.value
  lugarAbierto.value = null
  trigger?.focus()
}

// El estado no se edita aquí: lo mueve Administración.
const statusStyle = computed(() => STATUS_STYLE[props.activity?.status ?? 'programada'])

/** Evidencia de la visita ligada, cuando la actividad ya la tiene. */
const visita = computed(() => props.activity?.visita ?? null)

/** Sin `status` la evidencia sigue siendo evidencia: no se deja el separador solo. */
const evidencia = computed(() =>
  visita.value?.status ? `Visita registrada · ${visita.value.status}` : 'Visita registrada'
)

/** La visita se registra desde aquí mientras no esté ligada. */
const puedeRegistrar = computed(
  () =>
    props.canRegisterVisit &&
    props.activity !== null &&
    props.activity.tipo === VISIT_ACTIVITY_TYPE &&
    !visita.value
)

const visitTarget = computed(() => parseVisitDetail(props.activity?.detalle))

/**
 * La precarga de lugar sólo se aplica si el ámbito del auditor la contiene: el
 * select no puede quedarse en un valor que no ofrece.
 */
const scopedDefaults = computed(() => {
  const gerencia = props.scope.gerencias.find(
    (item) => item.gerenciaId === props.defaults?.gerencia
  )
  if (!gerencia) return { gerencia: '', agencia: '' }

  const agencia = props.defaults?.agencia
  return {
    gerencia: gerencia.gerenciaId,
    agencia: agencia && gerencia.agencias.includes(agencia) ? agencia : ''
  }
})

function reset() {
  const activity = props.activity
  const defaults = activity ? null : props.defaults

  tipo.value = activity?.tipo ?? defaults?.tipo ?? props.activityTypes[0]?.clave ?? ''
  detalle.value = activity?.detalle ?? defaults?.detalle ?? ''
  horaInicio.value = activity?.horaInicio ?? props.defaultHoraInicio
  duracion.value = activity
    ? toMinutes(activity.horaFin) - toMinutes(activity.horaInicio)
    : DEFAULT_DURATION_MINUTES
  prioridad.value = activity?.prioridad ?? 'media'

  const lugar = defaults ? scopedDefaults.value : { gerencia: '', agencia: '' }
  gerencia.value =
    activity?.gerencia || lugar.gerencia || props.scope.gerencias[0]?.gerenciaId || ''
  agencia.value = activity?.agencia || lugar.agencia || ''
  formError.value = ''
  confirmingDelete.value = false
  tipoAbierto.value = false
  lugarAbierto.value = null
}

watch(
  () => props.open,
  (open) => {
    if (!open) return

    reset()
    centrarHora()
  },
  { immediate: true }
)

/**
 * Cambiar la hora no borra la duración ya elegida: se conserva mientras quepa.
 * Si dejó de caber, baja a la más larga que sí cabe —no a la más corta, que
 * tiraría lo que el auditor había pedido—; y si no cabe ninguna, se queda en la
 * más corta para que el grupo no aparezca sin nada marcado, con el aviso abajo.
 */
watch([horaInicio, ocupado], () => {
  if (cabe(duracion.value)) return

  const posibles = DURATION_OPTIONS.filter(cabe)
  duracion.value = posibles.length ? posibles[posibles.length - 1] : DURATION_OPTIONS[0]
})

watch(gerencia, () => {
  if (agencia.value && !agencias.value.includes(agencia.value)) agencia.value = ''
})

function handleOpenChange(open: boolean) {
  if (!open) emit('close')
}

function submit() {
  if (!tipo.value) {
    formError.value = 'Elige una actividad.'
    return
  }

  if (!cabe(duracion.value)) {
    formError.value = 'A esa hora no cabe esa duración. Elige otra hora de inicio.'
    return
  }

  formError.value = ''
  emit('save', {
    tipo: tipo.value,
    detalle: detalle.value.trim() || undefined,
    horaInicio: horaInicio.value,
    horaFin: horaFin.value,
    prioridad: prioridad.value,
    gerencia: gerencia.value || undefined,
    agencia: agencia.value || undefined
  })
}
</script>

<template>
  <Drawer :open="open" @update:open="handleOpenChange">
    <DrawerContent class="max-h-[92vh]">
      <div class="mx-auto flex w-full max-w-lg flex-col overflow-y-auto">
        <DrawerHeader class="pb-2">
          <DrawerTitle>{{ activity ? 'Editar actividad' : 'Nueva actividad' }}</DrawerTitle>
          <DrawerDescription>
            {{ formatTime(horaInicio) }} – {{ formatTime(horaFin) }}
          </DrawerDescription>
        </DrawerHeader>

        <div class="space-y-4 px-4 pb-6">
          <!--
            Actividad: el renglón muestra la elegida y despliega las siete en su
            sitio, dentro de la hoja. Nada flota encima ni se sale de la
            tipografía del formulario. Son radios como los demás grupos: las
            flechas recorren la lista sin una línea de JS.
          -->
          <fieldset>
            <legend class="block text-sm font-medium text-gray-900 dark:text-white">
              Actividad
            </legend>
            <button
              ref="tipoTrigger"
              type="button"
              :aria-expanded="tipoAbierto"
              aria-controls="agenda-tipo-opciones"
              class="mt-1 flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 text-left text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              @click="tipoAbierto = !tipoAbierto"
            >
              <span class="truncate">{{ tipoNombre }}</span>
              <ChevronDown
                class="size-4 shrink-0 text-gray-600 transition-transform duration-200 motion-reduce:transition-none"
                :class="{ 'rotate-180': tipoAbierto }"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>

            <Transition
              enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="tipoAbierto"
                id="agenda-tipo-opciones"
                class="mt-1 overflow-hidden rounded-lg border border-gray-200"
              >
                <label
                  v-for="type in activityTypes"
                  :key="type.clave"
                  class="relative flex min-h-[44px] cursor-pointer items-center gap-2 border-b border-gray-100 px-3 text-sm last:border-b-0 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-blue-500"
                  :class="tipo === type.clave ? 'font-semibold text-blue-800' : 'text-gray-900'"
                  @click="elegirTipo"
                >
                  <input
                    v-model="tipo"
                    type="radio"
                    name="agenda-tipo"
                    :value="type.clave"
                    class="sr-only"
                  />
                  <!-- El hueco del check se reserva siempre: si no, la fila elegida se corre. -->
                  <Check
                    v-if="tipo === type.clave"
                    class="size-4 shrink-0"
                    :stroke-width="2"
                    aria-hidden="true"
                  />
                  <span v-else class="size-4 shrink-0" aria-hidden="true" />
                  {{ type.nombre }}
                </label>
              </div>
            </Transition>
          </fieldset>

          <!-- Detalle -->
          <div class="space-y-1">
            <LabelForm for="agenda-detalle" description="Opcional">Detalle</LabelForm>
            <textarea
              id="agenda-detalle"
              v-model="detalle"
              rows="2"
              :maxlength="DETAIL_MAX_LENGTH"
              placeholder="¿Qué vas a hacer?"
              class="block w-full rounded-lg border border-slate-100 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
            <p class="text-right text-xs text-gray-500">
              {{ detalle.length }}/{{ DETAIL_MAX_LENGTH }}
            </p>
          </div>

          <!--
            Inicio, partido en dos controles que caben a la vista: las 32 horas
            en una sola lista obligaban a recorrerla hasta las 2:30 pm. La hora
            va en un riel que se desliza y llega centrado en la elegida; los
            minutos son dos, porque la media hora es la unidad real de
            agendado. De ahí sale siempre un bloque que el backend acepta, que
            es lo que una lista larga no garantizaba. El rango completo se lee
            en la cabecera de la hoja.
          -->
          <fieldset>
            <legend class="block text-sm font-medium text-gray-900 dark:text-white">Inicio</legend>

            <div ref="horaRail" class="agenda-rail mt-1 flex snap-x gap-2 overflow-x-auto py-1">
              <label
                v-for="hour in START_HOURS"
                :key="hour"
                :data-selected="hour === horaSeleccionada"
                class="relative flex min-h-[44px] shrink-0 snap-center cursor-pointer items-center justify-center rounded-lg px-3 text-sm transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 motion-reduce:transition-none"
                :class="
                  hour === horaSeleccionada
                    ? 'border-2 border-blue-700 font-semibold text-blue-800'
                    : 'border border-gray-200 text-gray-700'
                "
              >
                <input
                  type="radio"
                  name="agenda-hora"
                  class="sr-only"
                  :value="hour"
                  :checked="hour === horaSeleccionada"
                  @change="setHora(hour)"
                />
                {{ formatHourLabel(hour) }}
              </label>
            </div>

            <div class="mt-2 grid grid-cols-2 gap-2">
              <label
                v-for="minute in START_MINUTES"
                :key="minute"
                class="relative flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg text-sm transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 motion-reduce:transition-none"
                :class="
                  minute === minutoSeleccionado
                    ? 'border-2 border-blue-700 font-semibold text-blue-800'
                    : 'border border-gray-200 text-gray-700'
                "
              >
                <!-- ":00" se lee mal en voz alta: el nombre va aparte del rótulo. -->
                <input
                  type="radio"
                  name="agenda-minuto"
                  class="sr-only"
                  :value="minute"
                  :checked="minute === minutoSeleccionado"
                  :aria-label="minute === 0 ? 'En punto' : 'Y media'"
                  @change="setMinuto(minute)"
                />
                :{{ String(minute).padStart(2, '0') }}
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend class="block text-sm font-medium text-gray-900 dark:text-white">
              Duración
            </legend>
            <div class="mt-1 grid grid-cols-4 gap-2">
              <!-- La que no cabe se deshabilita aquí, no al guardar. -->
              <label
                v-for="option in duraciones"
                :key="option.minutes"
                class="flex min-h-[44px] items-center justify-center rounded-lg px-1 text-sm transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 has-[:focus-visible]:ring-offset-1 motion-reduce:transition-none"
                :class="
                  option.disabled
                    ? 'cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-500'
                    : duracion === option.minutes
                      ? 'cursor-pointer border-2 border-blue-700 font-semibold text-blue-800'
                      : 'cursor-pointer border border-gray-200 text-gray-700'
                "
              >
                <input
                  v-model="duracion"
                  type="radio"
                  name="agenda-duracion"
                  :value="option.minutes"
                  :disabled="option.disabled"
                  class="sr-only"
                />
                {{ option.label }}
              </label>
            </div>
            <p v-if="sinDuracion" class="mt-1 text-xs text-red-700">
              A esa hora ya no cabe ninguna actividad. Elige otra hora de inicio.
            </p>
          </fieldset>

          <!--
            Prioridad: tres opciones a la vista y un toque para elegir. Un
            desplegable costaba dos —abrir y escoger— para una lista que cabe
            entera en el renglón.

            Son radios de verdad debajo del estilo: agrupan solos, se mueven con
            las flechas y anuncian "2 de 3" sin una línea de ARIA. Lo elegido se
            distingue por borde y peso además del color, no sólo por color.
            El punto es la prioridad; el fondo nunca se pinta.
          -->
          <fieldset>
            <legend class="block text-sm font-medium text-gray-900 dark:text-white">
              Prioridad
            </legend>
            <div class="mt-1 grid grid-cols-3 gap-2">
              <label
                v-for="option in PRIORITY_OPTIONS"
                :key="option"
                class="flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-sm transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 has-[:focus-visible]:ring-offset-1 motion-reduce:transition-none"
                :class="
                  prioridad === option
                    ? 'border-2 border-blue-700 font-semibold text-blue-800'
                    : 'border border-gray-200 text-gray-700'
                "
              >
                <input
                  v-model="prioridad"
                  type="radio"
                  name="agenda-prioridad"
                  :value="option"
                  class="sr-only"
                />
                <span class="size-2 shrink-0 rounded-full" :class="PRIORITY_STYLE[option].dot" />
                {{ PRIORITY_STYLE[option].label }}
              </label>
            </div>
          </fieldset>

          <!--
            Gerencia y agencia se despliegan como la actividad: `GERC001` y
            `GERC002` sólo cambian en el último dígito, y en vertical alineados a
            la izquierda se comparan de un vistazo. Los dos renglones cerrados
            comparten línea; la lista abierta ocupa el ancho completo, porque a
            media anchura los códigos quedaban apretados. Sólo se abre una a la
            vez, así que un panel basta. El encadenado no cambia: mover la
            gerencia limpia la agencia.
          -->
          <div class="space-y-1">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <p id="agenda-gerencia-label" class="text-sm font-medium text-gray-900 dark:text-white">
                  Gerencia
                </p>
                <button
                  ref="gerenciaTrigger"
                  type="button"
                  aria-labelledby="agenda-gerencia-label agenda-gerencia-valor"
                  :aria-expanded="lugarAbierto === 'gerencia'"
                  aria-controls="agenda-lugar-opciones"
                  class="flex min-h-[44px] w-full items-center justify-between gap-1 rounded-lg border border-gray-200 px-3 text-left text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  @click="alternarLugar('gerencia')"
                >
                  <span id="agenda-gerencia-valor" class="truncate">
                    {{ gerencia || 'Sin gerencia' }}
                  </span>
                  <ChevronDown
                    class="size-4 shrink-0 text-gray-600 transition-transform duration-200 motion-reduce:transition-none"
                    :class="{ 'rotate-180': lugarAbierto === 'gerencia' }"
                    :stroke-width="2"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div class="space-y-1">
                <p id="agenda-agencia-label" class="text-sm font-medium text-gray-900 dark:text-white">
                  Agencia
                </p>
                <!-- Sin agencias que ofrecer el renglón no se abre, y lo dice en
                     su sitio: "elige gerencia" y "no tiene agencias" no son lo mismo. -->
                <button
                  ref="agenciaTrigger"
                  type="button"
                  aria-labelledby="agenda-agencia-label agenda-agencia-valor"
                  :aria-expanded="lugarAbierto === 'agencia'"
                  aria-controls="agenda-lugar-opciones"
                  :disabled="!agencias.length"
                  class="flex min-h-[44px] w-full items-center justify-between gap-1 rounded-lg border border-gray-200 px-3 text-left text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  @click="alternarLugar('agencia')"
                >
                  <span id="agenda-agencia-valor" class="truncate">
                    {{ agencia || (gerencia ? 'Sin agencia' : 'Elige gerencia') }}
                  </span>
                  <ChevronDown
                    v-if="agencias.length"
                    class="size-4 shrink-0 text-gray-600 transition-transform duration-200 motion-reduce:transition-none"
                    :class="{ 'rotate-180': lugarAbierto === 'agencia' }"
                    :stroke-width="2"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <Transition
              enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <fieldset v-if="lugarAbierto" id="agenda-lugar-opciones">
                <legend class="sr-only">
                  {{ lugarAbierto === 'gerencia' ? 'Gerencia' : 'Agencia' }}
                </legend>
                <div class="overflow-hidden rounded-lg border border-gray-200">
                  <label
                    v-for="option in opcionesLugar"
                    :key="`${option.campo}-${option.valor}`"
                    class="relative flex min-h-[44px] cursor-pointer items-center gap-2 border-b border-gray-100 px-3 text-sm last:border-b-0 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-blue-500"
                    :class="
                      option.valor === valorLugar ? 'font-semibold text-blue-800' : 'text-gray-900'
                    "
                    @click="elegirLugar"
                  >
                    <input
                      type="radio"
                      :name="`agenda-${option.campo}`"
                      :value="option.valor"
                      :checked="option.valor === valorLugar"
                      class="sr-only"
                      @change="fijarLugar(option.campo, option.valor)"
                    />
                    <!-- El hueco del check se reserva siempre: si no, la fila elegida se corre. -->
                    <Check
                      v-if="option.valor === valorLugar"
                      class="size-4 shrink-0"
                      :stroke-width="2"
                      aria-hidden="true"
                    />
                    <span v-else class="size-4 shrink-0" aria-hidden="true" />
                    {{ option.valor || (option.campo === 'gerencia' ? 'Sin gerencia' : 'Sin agencia') }}
                  </label>
                </div>
              </fieldset>
            </Transition>

            <!-- Hay auditores sin ámbito y pueden capturar igual: se dice. -->
            <p v-if="!scope.gerencias.length" class="text-xs text-gray-700">
              No tienes gerencias asignadas. Puedes capturar la actividad sin ellas.
            </p>
          </div>

          <!-- Evidencia de la visita ligada. Nunca coordenadas. -->
          <div
            v-if="visita"
            class="space-y-1 rounded-lg border border-green-600 bg-green-50 p-2.5 text-green-900"
          >
            <p class="flex items-center gap-1.5 text-sm font-medium">
              <MapPinCheck class="size-4 shrink-0" :stroke-width="2" aria-hidden="true" />
              {{ evidencia }}
            </p>
            <p class="text-xs">{{ formatTimestampTime(visita.fecha) }}</p>
            <!-- Sin observaciones se dice, no se deja el hueco: mismo peso visual. -->
            <p class="text-xs">{{ visita.observaciones || 'Sin observaciones' }}</p>
          </div>

          <!-- Estado: informativo -->
          <div class="flex items-center justify-between border-t border-gray-100 pt-3">
            <div class="flex items-center gap-1.5 text-sm text-gray-900">
              <component :is="statusStyle.icon" class="size-4" :stroke-width="2" />
              {{ statusStyle.label }}
            </div>
            <p class="text-xs text-gray-500">El estado lo actualiza Administración</p>
          </div>

          <p v-if="formError" class="text-sm text-red-700">{{ formError }}</p>

          <!-- Acciones -->
          <div class="space-y-2">
            <template v-if="puedeRegistrar && activity">
              <BtnComponent
                v-if="visitTarget"
                full-width
                :disabled="saving"
                @click="emit('register-visit', activity)"
              >
                <template #icon-left>
                  <MapPin class="size-4" :stroke-width="2" aria-hidden="true" />
                </template>
                Registrar visita
              </BtnComponent>
              <p v-else class="text-xs text-gray-700">
                Para registrar la visita desde aquí, agéndala desde el reporte del call center.
              </p>
            </template>

            <BtnComponent
              :outline="puedeRegistrar && visitTarget !== null"
              full-width
              :loading="saving"
              @click="submit"
            >
              {{ activity ? 'Guardar cambios' : 'Agregar actividad' }}
            </BtnComponent>
            <BtnComponent outline full-width :disabled="saving" @click="emit('close')">
              Cancelar
            </BtnComponent>

            <template v-if="activity">
              <BtnComponent
                v-if="!confirmingDelete"
                variant="red"
                outline
                full-width
                :disabled="saving"
                @click="confirmingDelete = true"
              >
                Eliminar actividad
              </BtnComponent>
              <div v-else class="space-y-2 border-t border-gray-100 pt-3">
                <p class="text-sm text-gray-900">¿Eliminar esta actividad de tu agenda?</p>
                <div class="flex gap-2">
                  <BtnComponent
                    variant="red"
                    full-width
                    :loading="saving"
                    @click="emit('delete', activity.id)"
                  >
                    Sí, eliminar
                  </BtnComponent>
                  <BtnComponent outline full-width @click="confirmingDelete = false">
                    Cancelar
                  </BtnComponent>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<style scoped>
/*
  El navegador le pone `min-inline-size: min-content` a todo `<fieldset>`, así que
  no encoge: en vez de que el riel se deslice por dentro, el fieldset se estiraba
  hasta el ancho de sus dieciséis chips y arrastraba al formulario entero, que
  terminaba más ancho que la pantalla. Ninguno de esta hoja debe crecer más que
  ella; lo único que se desliza son los rieles.
*/
fieldset {
  min-inline-size: 0;
}

/* Los rieles se recorren con el dedo; la barra sólo estorbaría en 44px de alto.
   El chip cortado en el borde ya avisa de que hay más. */
.agenda-rail {
  scrollbar-width: none;
}

.agenda-rail::-webkit-scrollbar {
  display: none;
}
</style>
