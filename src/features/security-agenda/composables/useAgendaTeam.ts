import { computed, ref, type Ref } from 'vue'
import { useStore } from '@/shared/stores'
import { TEAM_MODULE } from '../constants'
import { agendaErrorMessage, securityAgendaService } from '../services/agenda.service'
import type { AgendaTeamMember } from '../types'

export interface TeamGroup {
  key: 'sin-enviar' | 'tarde' | 'a-tiempo'
  title: string
  members: AgendaTeamMember[]
  /** El grupo resuelto se muestra plegado: primero lo que necesita atención. */
  collapsedByDefault: boolean
}

/** El endpoint devuelve módulos sin shape garantizado: sólo importa su clave. */
function moduleKey(entry: unknown): string {
  if (typeof entry === 'string') return entry
  const record = entry as Record<string, unknown>
  const value = record?.modulo ?? record?.clave ?? record?.nombre ?? record?.id
  return typeof value === 'string' ? value : ''
}

export function useAgendaTeam(fecha: Ref<string>) {
  const $store = useStore()

  const hasTeamModule = ref(false)
  const members = ref<AgendaTeamMember[]>([])
  const loading = ref(false)
  const error = ref('')

  async function checkTeamModule() {
    const usuarioId = $store.user?.usuarioId
    if (!usuarioId) return

    try {
      const modules = await securityAgendaService.getUserModules(usuarioId)
      hasTeamModule.value = modules.some((entry) => moduleKey(entry) === TEAM_MODULE)
    } catch {
      // Sin respuesta de permisos la vista va sin pestañas: nunca al revés.
      hasTeamModule.value = false
    }
  }

  async function loadTeam() {
    loading.value = true
    error.value = ''

    try {
      members.value = await securityAgendaService.getTeam(fecha.value)
    } catch (err) {
      members.value = []
      error.value = agendaErrorMessage(err, 'No pudimos cargar a tu equipo.')
    } finally {
      loading.value = false
    }
  }

  const groups = computed<TeamGroup[]>(() => {
    const pending: AgendaTeamMember[] = []
    const late: AgendaTeamMember[] = []
    const onTime: AgendaTeamMember[] = []

    members.value.forEach((member) => {
      const agenda = member.agenda
      if (!agenda || agenda.status !== 'enviada') pending.push(member)
      else if (agenda.enviadaATiempo === false) late.push(member)
      else onTime.push(member)
    })

    return [
      { key: 'sin-enviar', title: 'Sin enviar', members: pending, collapsedByDefault: false },
      { key: 'tarde', title: 'Enviadas tarde', members: late, collapsedByDefault: false },
      { key: 'a-tiempo', title: 'Enviadas a tiempo', members: onTime, collapsedByDefault: true }
    ]
  })

  return {
    hasTeamModule,
    members,
    loading,
    error,
    groups,
    checkTeamModule,
    loadTeam
  }
}
