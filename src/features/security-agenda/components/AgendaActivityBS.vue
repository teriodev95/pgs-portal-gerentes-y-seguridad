<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { MapPin, MapPinCheck } from 'lucide-vue-next'
import {
  DEFAULT_DURATION_MINUTES,
  DETAIL_MAX_LENGTH,
  MAX_DURATION_MINUTES,
  PRIORITY_OPTIONS,
  PRIORITY_STYLE,
  STATUS_STYLE,
  VISIT_ACTIVITY_TYPE
} from '../constants'
import { formatTime, formatTimestampTime, timeSlots, toHHMM, toMinutes } from '../utils/time'
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
  /** Sólo en mi agenda: la visita se registra con mi usuario y mi ubicación. */
  canRegisterVisit?: boolean
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaults: null,
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
const horaFin = ref('')
const prioridad = ref<AgendaPriority>('media')
const gerencia = ref('')
const agencia = ref('')
const formError = ref('')
const confirmingDelete = ref(false)

const slots = timeSlots()
/** El fin de la jornada sólo sirve como hora de fin. */
const startSlots = slots.slice(0, -1)

// El backend rechaza más de 2 horas: si no se puede elegir, no se ofrece.
const endSlots = computed(() => {
  const start = toMinutes(horaInicio.value || '00:00')
  return slots.filter((slot) => {
    const end = toMinutes(slot)
    return end > start && end - start <= MAX_DURATION_MINUTES
  })
})

const agencias = computed(
  () => props.scope.gerencias.find((item) => item.gerenciaId === gerencia.value)?.agencias ?? []
)

// El estado no se edita aquí: lo mueve Administración.
const statusStyle = computed(() => STATUS_STYLE[props.activity?.status ?? 'programada'])

/** Evidencia de la visita ligada, cuando la actividad ya la tiene. */
const visita = computed(() => props.activity?.visita ?? null)

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
  horaFin.value =
    activity?.horaFin ?? toHHMM(toMinutes(horaInicio.value) + DEFAULT_DURATION_MINUTES)
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

// El fin sigue al inicio: siempre una hora después si quedó invertido.
watch(horaInicio, (value) => {
  if (toMinutes(horaFin.value) <= toMinutes(value)) {
    horaFin.value = toHHMM(toMinutes(value) + DEFAULT_DURATION_MINUTES)
  }
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

  if (toMinutes(horaFin.value) <= toMinutes(horaInicio.value)) {
    formError.value = 'La hora de fin debe ser posterior a la de inicio.'
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

          <!-- Horario -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <LabelForm for="agenda-inicio">Inicio</LabelForm>
              <InputSelect id="agenda-inicio" v-model="horaInicio">
                <option v-for="slot in startSlots" :key="`inicio-${slot}`" :value="slot">
                  {{ formatTime(slot) }}
                </option>
              </InputSelect>
            </div>
            <div class="space-y-1">
              <LabelForm for="agenda-fin">Fin</LabelForm>
              <InputSelect id="agenda-fin" v-model="horaFin">
                <option v-for="slot in endSlots" :key="`fin-${slot}`" :value="slot">
                  {{ formatTime(slot) }}
                </option>
              </InputSelect>
            </div>
          </div>

          <!-- Prioridad: punto de color + texto, nunca fondo de color -->
          <div class="space-y-1">
            <LabelForm for="agenda-prioridad">Prioridad</LabelForm>
            <div id="agenda-prioridad" class="grid grid-cols-3 gap-2">
              <button
                v-for="option in PRIORITY_OPTIONS"
                :key="option"
                type="button"
                class="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border p-2.5 text-sm"
                :class="
                  prioridad === option
                    ? 'border-blue-700 font-medium text-blue-800'
                    : 'border-gray-200 text-gray-700'
                "
                @click="prioridad = option"
              >
                <span class="size-2 rounded-full" :class="PRIORITY_STYLE[option].dot" />
                {{ PRIORITY_STYLE[option].label }}
              </button>
            </div>
          </div>

          <!-- Gerencia y agencia del ámbito -->
          <div class="space-y-1">
            <LabelForm for="agenda-gerencia">Gerencia</LabelForm>
            <InputSelect id="agenda-gerencia" v-model="gerencia" :is-required="false">
              <!-- Hay auditores sin ámbito y pueden capturar igual: se dice. -->
              <option value="">
                {{ scope.gerencias.length ? 'Sin gerencia' : 'No tienes gerencias asignadas' }}
              </option>
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
              <option value="">
                {{ agencias.length ? 'Sin agencia' : 'Elige primero una gerencia' }}
              </option>
              <option v-for="item in agencias" :key="item" :value="item">{{ item }}</option>
            </InputSelect>
          </div>

          <!-- Evidencia de la visita ligada. Nunca coordenadas. -->
          <div
            v-if="visita"
            class="space-y-1 rounded-lg border border-green-600 bg-green-50 p-2.5 text-green-900"
          >
            <p class="flex items-center gap-1.5 text-sm font-medium">
              <MapPinCheck class="size-4 shrink-0" :stroke-width="2" aria-hidden="true" />
              Visita registrada · {{ visita.status }}
            </p>
            <p class="text-xs">
              {{ formatTimestampTime(visita.fecha) }}
              <span v-if="visita.tieneUbicacion">· Con ubicación</span>
            </p>
            <p v-if="visita.observaciones" class="text-xs">{{ visita.observaciones }}</p>
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
