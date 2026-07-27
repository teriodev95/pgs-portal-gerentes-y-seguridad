<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DEFAULT_DURATION_MINUTES,
  DETAIL_MAX_LENGTH,
  PRIORITY_OPTIONS,
  PRIORITY_STYLE,
  STATUS_STYLE
} from '../constants'
import { formatTime, timeSlots, toHHMM, toMinutes } from '../utils/time'
import type {
  AgendaActivity,
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
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), { saving: false })

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: ActivityFormPayload): void
  (e: 'delete', id: number): void
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

const endSlots = computed(() =>
  slots.filter((slot) => toMinutes(slot) > toMinutes(horaInicio.value || '00:00'))
)

const agencias = computed(
  () => props.scope.gerencias.find((item) => item.gerenciaId === gerencia.value)?.agencias ?? []
)

// El estado no se edita aquí: lo mueve Administración.
const statusStyle = computed(() => STATUS_STYLE[props.activity?.status ?? 'programada'])

function reset() {
  const activity = props.activity
  tipo.value = activity?.tipo ?? props.activityTypes[0]?.clave ?? ''
  detalle.value = activity?.detalle ?? ''
  horaInicio.value = activity?.horaInicio ?? props.defaultHoraInicio
  horaFin.value =
    activity?.horaFin ?? toHHMM(toMinutes(horaInicio.value) + DEFAULT_DURATION_MINUTES)
  prioridad.value = activity?.prioridad ?? 'media'
  gerencia.value = activity?.gerencia ?? props.scope.gerencias[0]?.gerenciaId ?? ''
  agencia.value = activity?.agencia ?? ''
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
                <option v-for="slot in slots" :key="`inicio-${slot}`" :value="slot">
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
                class="flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-sm"
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
              <option value="">
                {{ agencias.length ? 'Sin agencia' : 'Elige primero una gerencia' }}
              </option>
              <option v-for="item in agencias" :key="item" :value="item">{{ item }}</option>
            </InputSelect>
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
            <BtnComponent full-width :loading="saving" @click="submit">
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
