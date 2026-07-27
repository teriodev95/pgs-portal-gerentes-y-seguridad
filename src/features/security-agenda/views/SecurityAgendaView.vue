<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatToHumanDate } from '@/shared/utils'
import { EMPTY_AGENDA_DESCRIPTION, EMPTY_AGENDA_MESSAGE } from '../constants'
import { useAgendaTimeline, useSecurityAgenda } from '../composables'
import { todayISO, tomorrowISO } from '../utils/time'
import type { AgendaActivity } from '../types'

// Components
import AgendaActivityBS from '../components/AgendaActivityBS.vue'
import AgendaTimeline from '../components/AgendaTimeline.vue'
import AgendaTimelineSkeleton from '../components/AgendaTimelineSkeleton.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'

const $router = useRouter()

const {
  fecha,
  activityTypes,
  scope,
  loading,
  saving,
  loadError,
  activities,
  completed,
  loadCatalogs,
  load,
  createActivity,
  updateActivity,
  deleteActivity
} = useSecurityAgenda()

const { rows, expandLeading, expandTrailing } = useAgendaTimeline(activities, fecha)

const sheetOpen = ref(false)
const editing = ref<AgendaActivity | null>(null)
const defaultHoraInicio = ref('08:00')

const timeline = ref<InstanceType<typeof AgendaTimeline>>()

const progress = computed(() =>
  activities.value.length ? Math.round((completed.value / activities.value.length) * 100) : 0
)

const activityCountLabel = computed(() => {
  const total = activities.value.length
  return `${total} ${total === 1 ? 'actividad' : 'actividades'} · ${completed.value} ${
    completed.value === 1 ? 'hecha' : 'hechas'
  }`
})

const isEmpty = computed(() => !loading.value && !loadError.value && !activities.value.length)

const emptyMessage = computed(() =>
  fecha.value === todayISO() ? EMPTY_AGENDA_MESSAGE : 'Tu agenda de mañana está vacía'
)

onMounted(async () => {
  loadCatalogs()
  await load()
  scrollToNow()
})

watch(fecha, async () => {
  await load()
  scrollToNow()
})

/** Deja la línea del ahora a ~1/3 de la pantalla al abrir la vista. */
async function scrollToNow() {
  await nextTick()
  const element = timeline.value?.nowElement
  if (!element) return

  const top = element.getBoundingClientRect().top + window.scrollY - window.innerHeight / 3
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' })
}

function setFecha(value: string) {
  if (fecha.value !== value) fecha.value = value
}

function openGap(hour: number) {
  editing.value = null
  defaultHoraInicio.value = `${String(hour).padStart(2, '0')}:00`
  sheetOpen.value = true
}

function openActivity(activity: AgendaActivity) {
  editing.value = activity
  defaultHoraInicio.value = activity.horaInicio
  sheetOpen.value = true
}

async function handleSave(payload: Parameters<typeof createActivity>[0]) {
  const ok = editing.value
    ? await updateActivity(editing.value.id, payload)
    : await createActivity(payload)
  if (ok) sheetOpen.value = false
}

async function handleDelete(id: string) {
  if (await deleteActivity(id)) sheetOpen.value = false
}
</script>

<template>
  <MainCT>
    <NavbarCT
      title="Agendas de seguridad"
      :subtitles="[formatToHumanDate(fecha)]"
      show-back-button
      @back="$router.back()"
    />

    <div class="space-y-3 px-3 pb-10 pt-3">
      <!-- Sólo hoy y mañana: la agenda es un compromiso del día -->
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded-lg border p-2 text-sm"
          :class="
            fecha === todayISO()
              ? 'border-blue-700 font-medium text-blue-800'
              : 'border-gray-200 text-gray-700'
          "
          @click="setFecha(todayISO())"
        >
          Hoy
        </button>
        <button
          type="button"
          class="rounded-lg border p-2 text-sm"
          :class="
            fecha === tomorrowISO()
              ? 'border-blue-700 font-medium text-blue-800'
              : 'border-gray-200 text-gray-700'
          "
          @click="setFecha(tomorrowISO())"
        >
          Mañana
        </button>
      </div>

      <!-- Cabecera: avance del día -->
      <div class="rounded-lg border border-gray-200 bg-white p-3">
        <div class="flex items-baseline justify-between gap-2">
          <p class="text-sm font-semibold text-gray-900">Mi agenda</p>
          <p class="text-xs text-gray-700">{{ activityCountLabel }}</p>
        </div>

        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div class="agenda-progress h-full bg-blue-700" :style="{ width: `${progress}%` }" />
        </div>
      </div>

      <!-- Error de carga: mensaje del backend tal cual -->
      <div v-if="loadError" class="rounded-lg border border-red-600 bg-red-50 p-3">
        <p class="text-sm text-red-900">{{ loadError }}</p>
        <button type="button" class="mt-2 text-sm font-medium text-red-900" @click="load()">
          Reintentar
        </button>
      </div>

      <AgendaTimelineSkeleton v-else-if="loading" />

      <template v-else>
        <EmptyCT
          v-if="isEmpty"
          compact
          :message="emptyMessage"
          :description="EMPTY_AGENDA_DESCRIPTION"
        />

        <AgendaTimeline
          ref="timeline"
          :rows="rows"
          @select-gap="openGap"
          @select-activity="openActivity"
          @expand="(position) => (position === 'leading' ? expandLeading() : expandTrailing())"
        />
      </template>
    </div>
  </MainCT>

  <!-- Alta y edición -->
  <AgendaActivityBS
    :open="sheetOpen"
    :activity="editing"
    :default-hora-inicio="defaultHoraInicio"
    :activity-types="activityTypes"
    :scope="scope"
    :saving="saving"
    @close="sheetOpen = false"
    @save="handleSave"
    @delete="handleDelete"
  />
</template>

<style scoped>
.agenda-progress {
  transition: width 250ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .agenda-progress {
    transition: none;
  }
}
</style>
