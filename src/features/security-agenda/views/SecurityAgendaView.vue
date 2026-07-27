<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatToHumanDate } from '@/shared/utils'
import { EMPTY_AGENDA_DESCRIPTION, EMPTY_AGENDA_MESSAGE } from '../constants'
import {
  useAgendaCutoff,
  useAgendaShare,
  useAgendaTeam,
  useAgendaTimeline,
  useSecurityAgenda
} from '../composables'
import { todayISO, tomorrowISO } from '../utils/time'
import type { AgendaActivity, AgendaTeamMember, AgendaTimelineActivity } from '../types'

// Components
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AgendaActivityBS from '../components/AgendaActivityBS.vue'
import AgendaShareRow from '../components/AgendaShareRow.vue'
import AgendaTeamList from '../components/AgendaTeamList.vue'
import AgendaTimeline from '../components/AgendaTimeline.vue'
import AgendaTimelineSkeleton from '../components/AgendaTimelineSkeleton.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'

const $router = useRouter()

const {
  fecha,
  auditorId,
  agenda,
  activityTypes,
  scope,
  loading,
  saving,
  loadError,
  activities,
  completed,
  isSent,
  canSend,
  loadCatalogs,
  load,
  createActivity,
  updateActivity,
  deleteActivity,
  send,
  share,
  revokeShare
} = useSecurityAgenda()

const { rows, expandLeading, expandTrailing } = useAgendaTimeline(activities, fecha)

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

const team = useAgendaTeam(fecha)
const { shareAgenda, copyLink, buildShareText } = useAgendaShare()

const tab = ref<'mi-agenda' | 'equipo'>('mi-agenda')
const selectedMember = ref<AgendaTeamMember | null>(null)

const sheetOpen = ref(false)
const editing = ref<AgendaActivity | null>(null)
const defaultHoraInicio = ref('08:00')
const sentOpen = ref(false)

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

/** El jefe abre la agenda de un auditor: puede editarla, no enviarla por él. */
const isTeamDetail = computed(() => selectedMember.value !== null)

const headerTitle = computed(() =>
  selectedMember.value ? selectedMember.value.nombre : 'Mi agenda'
)

onMounted(async () => {
  loadCatalogs()
  team.checkTeamModule()
  await load()
  scrollToNow()
})

watch(fecha, async () => {
  await load()
  if (tab.value === 'equipo' && !isTeamDetail.value) team.loadTeam()
  scrollToNow()
})

watch(tab, (value) => {
  if (value === 'equipo' && !team.members.value.length) team.loadTeam()
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

// El riel sólo emite selección cuando es editable, y ahí la actividad viene
// completa: la vista pública lo monta en `readonly`.
function openActivity(activity: AgendaTimelineActivity) {
  editing.value = activity as AgendaActivity
  defaultHoraInicio.value = activity.horaInicio
  sheetOpen.value = true
}

async function handleSave(payload: Parameters<typeof createActivity>[0]) {
  const ok = editing.value
    ? await updateActivity(editing.value.id, {
        ...payload,
        // El PUT sólo toca lo que viaja: `null` limpia el campo, omitirlo
        // dejaría el valor anterior y no se podría borrar nada.
        detalle: payload.detalle ?? null,
        gerencia: payload.gerencia ?? null,
        agencia: payload.agencia ?? null
      })
    : await createActivity(payload)
  if (ok) sheetOpen.value = false
}

async function handleDelete(id: number) {
  if (await deleteActivity(id)) sheetOpen.value = false
}

async function handleSend() {
  if (await send()) sentOpen.value = true
}

/** Genera el enlace si aún no existe y abre la hoja nativa de compartir. */
async function handleShare() {
  if (!agenda.value) return

  const url = agenda.value.shareUrl || (await share())?.url
  if (!url) return

  await shareAgenda({
    fecha: agenda.value.fecha,
    auditorNombre: agenda.value.auditorNombre,
    auditorUsuario: agenda.value.auditorUsuario,
    totalActividades: activities.value.length,
    url
  })
  sentOpen.value = false
}

async function handleCopy() {
  if (!agenda.value?.shareUrl) return

  const text = buildShareText({
    fecha: agenda.value.fecha,
    auditorNombre: agenda.value.auditorNombre,
    auditorUsuario: agenda.value.auditorUsuario,
    totalActividades: activities.value.length,
    url: agenda.value.shareUrl
  })
  await copyLink(`${text}\n${agenda.value.shareUrl}`)
}

/** El timeline del auditor se abre en la misma pestaña, con acciones de mando. */
async function openMember(member: AgendaTeamMember) {
  selectedMember.value = member
  auditorId.value = member.auditorId
  tab.value = 'mi-agenda'
  await load()
  scrollToNow()
}

async function backToTeam() {
  selectedMember.value = null
  auditorId.value = undefined
  tab.value = 'equipo'
  await load()
  team.loadTeam()
}

function goBack() {
  if (isTeamDetail.value) backToTeam()
  else $router.back()
}
</script>

<template>
  <MainCT>
    <NavbarCT
      title="Agendas de seguridad"
      :subtitles="[formatToHumanDate(fecha)]"
      show-back-button
      @back="goBack"
    />

    <Tabs v-model="tab" class="block px-3 pb-44 pt-2">
      <TabsList v-if="team.hasTeamModule.value && !isTeamDetail" class="grid w-full grid-cols-2">
        <TabsTrigger value="mi-agenda">Mi agenda</TabsTrigger>
        <TabsTrigger value="equipo">Mi equipo</TabsTrigger>
      </TabsList>

      <!-- Mi agenda / agenda de un auditor a cargo -->
      <TabsContent value="mi-agenda" class="mt-3 space-y-3">
        <button
          v-if="isTeamDetail"
          type="button"
          class="text-sm font-medium text-blue-700"
          @click="backToTeam"
        >
          ← Volver a mi equipo
        </button>

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

        <!-- Cabecera: avance del día + estado de envío -->
        <div class="rounded-lg border border-gray-200 bg-white p-3">
          <div class="flex items-baseline justify-between gap-2">
            <p class="text-sm font-semibold text-gray-900">{{ headerTitle }}</p>
            <p class="text-xs text-gray-700">{{ activityCountLabel }}</p>
          </div>

          <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div class="agenda-progress h-full bg-blue-700" :style="{ width: `${progress}%` }" />
          </div>

          <div class="mt-3 rounded-lg border p-2.5" :class="cutoff.classes">
            <p class="text-sm font-medium">{{ cutoff.label }}</p>
            <p v-if="!cutoff.collapsed && cutoff.detail" class="mt-0.5 text-xs">
              {{ cutoff.detail }}
            </p>
          </div>
        </div>

        <!-- Enlace público, sólo si ya existe token -->
        <AgendaShareRow
          v-if="agenda?.shareToken"
          :busy="saving"
          @share="handleShare"
          @copy="handleCopy"
          @revoke="revokeShare"
        />

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
      </TabsContent>

      <!-- Mi equipo -->
      <TabsContent value="equipo" class="mt-3 space-y-3">
        <div v-if="team.error.value" class="rounded-lg border border-red-600 bg-red-50 p-3">
          <p class="text-sm text-red-900">{{ team.error.value }}</p>
          <button
            type="button"
            class="mt-2 text-sm font-medium text-red-900"
            @click="team.loadTeam()"
          >
            Reintentar
          </button>
        </div>

        <div v-else-if="team.loading.value" role="status" class="space-y-2">
          <div
            v-for="row in 3"
            :key="`team-skeleton-${row}`"
            class="h-24 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
          />
          <span class="sr-only">Cargando equipo…</span>
        </div>

        <EmptyCT
          v-else-if="!team.members.value.length"
          compact
          message="Sin auditores a tu cargo"
          description="Cuando tengas auditores asignados verás aquí el estado de sus agendas."
        />

        <AgendaTeamList v-else :groups="team.groups.value" @select="openMember" />
      </TabsContent>
    </Tabs>

    <!-- Acción primaria fija -->
    <div
      v-if="!isTeamDetail && tab === 'mi-agenda'"
      class="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white p-3"
    >
      <BtnComponent v-if="isSent" full-width :loading="saving" @click="handleShare">
        Compartir agenda
      </BtnComponent>
      <template v-else>
        <BtnComponent full-width :disabled="!canSend" :loading="saving" @click="handleSend">
          Enviar agenda
        </BtnComponent>
        <p v-if="!activities.length" class="mt-1.5 text-center text-xs text-gray-700">
          Agrega al menos una actividad para poder enviarla.
        </p>
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

  <!-- Confirmación de envío -->
  <Drawer :open="sentOpen" @update:open="(value: boolean) => (sentOpen = value)">
    <DrawerContent>
      <div class="mx-auto w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>{{ cutoff.label }}</DrawerTitle>
        </DrawerHeader>
        <div class="space-y-2 p-4 pb-6">
          <p class="text-sm text-gray-700">
            Tu agenda quedó registrada. Puedes compartir el enlace con el grupo.
          </p>
          <BtnComponent full-width :loading="saving" @click="handleShare">
            Compartir al grupo
          </BtnComponent>
          <BtnComponent outline full-width @click="sentOpen = false">Ahora no</BtnComponent>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
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
