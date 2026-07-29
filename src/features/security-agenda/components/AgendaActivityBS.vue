<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { MapPin, MapPinCheck } from 'lucide-vue-next'
import {
  DAY_END_HOUR,
  DEFAULT_DURATION_MINUTES,
  DETAIL_MAX_LENGTH,
  DURATION_OPTIONS,
  PRIORITY_OPTIONS,
  PRIORITY_STYLE,
  STATUS_STYLE,
  VISIT_ACTIVITY_TYPE
} from '../constants'
import {
  formatDuration,
  formatTime,
  formatTimestampTime,
  timeSlots,
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
import InputSelect from '@/shared/components/forms/InputSelect.vue'
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

/** El fin de la jornada sólo sirve como hora de fin. */
const startSlots = timeSlots().slice(0, -1)

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
}

watch(
  () => props.open,
  (open) => {
    if (open) reset()
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
          <!-- Actividad -->
          <div class="space-y-1">
            <LabelForm for="agenda-tipo">Actividad</LabelForm>
            <InputSelect id="agenda-tipo" v-model="tipo">
              <option value="" disabled>Selecciona una actividad</option>
              <option v-for="type in activityTypes" :key="type.clave" :value="type.clave">
                {{ type.nombre }}
              </option>
            </InputSelect>
          </div>

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
            Inicio sigue siendo un desplegable: son 32 horas y ése es su
            control. El fin, en cambio, no se elige, se deduce: el backend cierra
            la duración en pasos de media hora hasta dos, así que son cuatro
            opciones y caben a la vista. Se piensa en "cuánto dura", que es como
            se dice, y el rango que resulta se lee arriba, en la cabecera.
          -->
          <div class="space-y-1">
            <LabelForm for="agenda-inicio">Inicio</LabelForm>
            <InputSelect id="agenda-inicio" v-model="horaInicio">
              <option v-for="slot in startSlots" :key="`inicio-${slot}`" :value="slot">
                {{ formatTime(slot) }}
              </option>
            </InputSelect>
          </div>

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
            Gerencia y agencia son un solo dato en dos pasos: van en el mismo
            renglón, como inicio y duración. Los dos llevan claves cortas
            (GERGC, no nombres), así que a 360px la mitad del ancho les sobra.
          -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <LabelForm for="agenda-gerencia">Gerencia</LabelForm>
              <InputSelect id="agenda-gerencia" v-model="gerencia" :is-required="false">
                <option value="">Sin gerencia</option>
                <option
                  v-for="item in scope.gerencias"
                  :key="item.gerenciaId"
                  :value="item.gerenciaId"
                >
                  {{ item.gerenciaId }}
                </option>
              </InputSelect>
            </div>

            <div class="space-y-1">
              <LabelForm for="agenda-agencia">Agencia</LabelForm>
              <InputSelect
                id="agenda-agencia"
                v-model="agencia"
                :is-required="false"
                :is-disabled="!agencias.length"
              >
                <!-- Sin gerencia elegida no hay nada que ofrecer; con una que no
                     tiene agencias, tampoco. No son lo mismo y no se dicen igual. -->
                <option value="">{{ gerencia ? 'Sin agencia' : 'Elige gerencia' }}</option>
                <option v-for="item in agencias" :key="item" :value="item">{{ item }}</option>
              </InputSelect>
            </div>
          </div>

          <!--
            Hay auditores sin ámbito y pueden capturar igual: se dice, pero
            abajo. Como opción del desplegable no cabía en media pantalla.
          -->
          <p v-if="!scope.gerencias.length" class="text-xs text-gray-700">
            No tienes gerencias asignadas. Puedes capturar la actividad sin ellas.
          </p>

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
