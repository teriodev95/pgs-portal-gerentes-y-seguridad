<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { formatToHumanDate } from '@/shared/utils'
import {
  agendaErrorMessage,
  agendaErrorStatus,
  securityAgendaService
} from '../services/agenda.service'
import { useAgendaCutoff, useAgendaTimeline } from '../composables'
import { VISIT_ACTIVITY_TYPE } from '../constants'
import { formatRelative, todayISO } from '../utils/time'
import type { AgendaPublic } from '../types'

// Components
import AgendaTimeline from '../components/AgendaTimeline.vue'
import AgendaTimelineSkeleton from '../components/AgendaTimelineSkeleton.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'

// Vista autónoma: se abre sin sesión, sin layout de dashboard y sin store.
const $route = useRoute()

const agenda = ref<AgendaPublic | null>(null)
const loading = ref(true)
const error = ref('')

const fecha = computed(() => agenda.value?.fecha ?? todayISO())

/**
 * Este enlace circula por WhatsApp: una visita se ve como "Visita call center"
 * y nada más —sin cliente, sin préstamo y sin evidencia—. El backend ya lo
 * recorta; que este enlace no exponga a un cliente no depende de recordarlo
 * en dos lados.
 */
const activities = computed(() =>
  (agenda.value?.actividades ?? []).map((activity) =>
    activity.tipo === VISIT_ACTIVITY_TYPE
      ? { ...activity, detalle: null, visita: null }
      : activity
  )
)

const { rows } = useAgendaTimeline(activities, fecha)

const cutoffSource = computed(() =>
  agenda.value
    ? {
        status: agenda.value.status,
        enviadaAt: agenda.value.enviadaAt,
        enviadaATiempo: agenda.value.enviadaATiempo
      }
    : null
)
const { state: cutoff } = useAgendaCutoff(fecha, cutoffSource)

/**
 * El enlace sigue vivo: si Administración mueve algo a media mañana, este mismo
 * enlace lo refleja. La marca lo dice, para que no se lea como una captura.
 * Mientras el backend no la mande, `formatRelative` devuelve '' y la línea no sale.
 */
const lastUpdate = computed(() => formatRelative(agenda.value?.actualizadaEn ?? null))

const activityCountLabel = computed(() => {
  const total = activities.value.length
  return `${total} ${total === 1 ? 'actividad' : 'actividades'}`
})

onMounted(async () => {
  const token = String($route.params.token || '')

  try {
    agenda.value = await securityAgendaService.getPublicAgenda(token)
  } catch (err) {
    const status = agendaErrorStatus(err)
    if (status === 404) error.value = 'Este enlace no es válido. Pide uno nuevo al auditor.'
    else if (status === 410) error.value = 'Este enlace venció. Pide uno nuevo al auditor.'
    else error.value = agendaErrorMessage(err, 'No pudimos abrir la agenda. Intenta más tarde.')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <MainCT>
    <NavbarCT
      :title="agenda ? agenda.auditorNombre : 'Agenda de seguridad'"
      :subtitles="agenda ? [formatToHumanDate(agenda.fecha)] : ['Sólo lectura']"
    />

    <div class="space-y-3 px-3 pb-10 pt-3">
      <template v-if="loading">
        <AgendaTimelineSkeleton />
      </template>

      <div v-else-if="error" class="rounded-lg border border-gray-200 bg-white p-4">
        <p class="text-sm font-semibold text-gray-900">No pudimos mostrar esta agenda</p>
        <p class="mt-1 text-sm text-gray-700">{{ error }}</p>
      </div>

      <template v-else-if="agenda">
        <div class="rounded-lg border border-gray-200 bg-white p-3">
          <div class="flex items-baseline justify-between gap-2">
            <p class="text-sm font-semibold text-gray-900">Agenda del día</p>
            <p class="text-xs text-gray-700">{{ activityCountLabel }}</p>
          </div>
          <div class="mt-2 rounded-lg border p-2.5" :class="cutoff.classes">
            <p class="text-sm font-medium">{{ cutoff.label }}</p>
          </div>
        </div>

        <AgendaTimeline :rows="rows" readonly />

        <div class="space-y-2 pt-2 text-center">
          <p v-if="lastUpdate" class="text-xs text-gray-600">Actualizado {{ lastUpdate }}</p>
          <a href="/" class="btn-primary-outline inline-block">Abrir en PGS</a>
        </div>
      </template>
    </div>
  </MainCT>
</template>
