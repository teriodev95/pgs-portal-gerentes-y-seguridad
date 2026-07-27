<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { formatTimestampTime } from '../utils/time'
import type { TeamGroup } from '../composables/useAgendaTeam'
import type { AgendaTeamMember } from '../types'

interface Props {
  groups: TeamGroup[]
}

const props = defineProps<Props>()

defineEmits<{ (e: 'select', member: AgendaTeamMember): void }>()

// El grupo resuelto ("a tiempo") arranca plegado: primero lo que falta.
const collapsed = ref(
  new Set(props.groups.filter((group) => group.collapsedByDefault).map((group) => group.key))
)

function toggle(key: TeamGroup['key']) {
  const next = new Set(collapsed.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  collapsed.value = next
}

function statusLine(member: AgendaTeamMember): string {
  const agenda = member.agenda
  if (!agenda) return 'Sin agenda'

  const progreso = `${agenda.completadas}/${agenda.totalActividades} hechas`
  if (agenda.status !== 'enviada') return `Sin enviar · ${progreso}`

  const hora = formatTimestampTime(agenda.enviadaAt)
  const envio = agenda.enviadaATiempo === false ? `Enviada tarde ${hora}` : `Enviada ${hora}`
  return `${envio} · ${progreso}`
}

function pendientes(member: AgendaTeamMember): number {
  const agenda = member.agenda
  if (!agenda) return 0
  return Math.max(0, agenda.totalActividades - agenda.completadas)
}
</script>

<template>
  <div class="space-y-4">
    <section v-for="group in groups" :key="group.key">
      <button
        type="button"
        class="flex w-full items-center gap-1.5 py-1 text-left"
        @click="toggle(group.key)"
      >
        <component
          :is="collapsed.has(group.key) ? ChevronRight : ChevronDown"
          class="size-4 text-gray-600"
          :stroke-width="2"
        />
        <span class="text-sm font-semibold text-gray-900">{{ group.title }}</span>
        <span class="text-sm text-gray-600">({{ group.members.length }})</span>
      </button>

      <p v-if="!group.members.length" class="pl-6 text-xs text-gray-600">Nadie en este grupo.</p>

      <div v-else-if="!collapsed.has(group.key)" class="mt-1 space-y-2">
        <button
          v-for="member in group.members"
          :key="member.auditorId"
          type="button"
          class="w-full rounded-lg border border-gray-200 bg-white p-3 text-left"
          @click="$emit('select', member)"
        >
          <div class="flex items-baseline justify-between gap-2">
            <p class="truncate text-sm font-semibold text-gray-900">{{ member.nombre }}</p>
            <p class="shrink-0 text-xs text-gray-600">{{ member.usuario }}</p>
          </div>
          <p class="mt-0.5 text-xs text-gray-700">{{ statusLine(member) }}</p>

          <!-- Mini-franja del día: el contrato de /equipo sólo expone totales,
               así que segmenta hechas contra pendientes. -->
          <div class="mt-2 flex h-6 gap-0.5 overflow-hidden rounded">
            <template v-if="member.agenda?.totalActividades">
              <span
                v-if="member.agenda.completadas"
                class="bg-green-600"
                :style="{ flexGrow: member.agenda.completadas }"
              />
              <span
                v-if="pendientes(member)"
                class="bg-gray-300"
                :style="{ flexGrow: pendientes(member) }"
              />
            </template>
            <span
              v-else
              class="flex-1 rounded border border-dashed border-gray-300 text-[10px] leading-6 text-gray-600"
            >
              &nbsp;Sin actividades
            </span>
          </div>
        </button>
      </div>
    </section>
  </div>
</template>
