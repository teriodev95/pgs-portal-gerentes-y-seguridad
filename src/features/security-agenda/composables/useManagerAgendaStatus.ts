import { computed, ref, watch } from 'vue'
import { useStore } from '@/shared/stores'
import { securityAgendaService } from '../services/agenda.service'
import { todayISO } from '../utils/time'
import { useAgendaAccess } from './useAgendaAccess'
import { useAgendaCutoff } from './useAgendaCutoff'
import type { AgendaTeamMember } from '../types'

/**
 * Una sola llamada por sesión y día para todos los gerentes del usuario: cambiar
 * de gerencia en el Home sólo filtra lo que ya llegó. Un fallo no se queda
 * guardado, para que la siguiente visita al Home lo vuelva a intentar.
 */
let cache: { key: string; members: Promise<AgendaTeamMember[]> } | null = null

function loadManagers(usuarioId: number, fecha: string): Promise<AgendaTeamMember[]> {
  const key = `${usuarioId}|${fecha}`
  if (cache?.key !== key) {
    const members = securityAgendaService.getTeam(fecha, { rol: 'gerentes' })
    cache = { key, members }
    members.catch(() => {
      if (cache?.key === key) cache = null
    })
  }
  return cache.members
}

/**
 * Estado de hoy de la agenda del gerente de la gerencia seleccionada, para el
 * tile "Agenda gerente": el mismo punto que el FAB de la agenda propia (ámbar
 * antes del corte, rojo después) y verde cuando ya la envió.
 */
export function useManagerAgendaStatus() {
  const $store = useStore()
  const { canViewManagerAgenda } = useAgendaAccess()

  const fecha = ref(todayISO())
  /** `null` mientras no hay respuesta: sin dato no se afirma nada en el tile. */
  const members = ref<AgendaTeamMember[] | null>(null)

  watch(
    canViewManagerAgenda,
    async (allowed) => {
      const usuarioId = $store.user?.usuarioId
      if (!allowed || !usuarioId || members.value) return
      try {
        members.value = await loadManagers(usuarioId, fecha.value)
      } catch {
        members.value = null
      }
    },
    { immediate: true }
  )

  const agenda = computed(
    () => members.value?.find((member) => member.gerencia === $store.gerenciaSelected)?.agenda ?? null
  )

  /** Ya respondió el backend y no hay agenda de hoy (o la gerencia está vacante). */
  const withoutAgenda = computed(() => members.value !== null && !agenda.value)

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

  const mark = computed(() => {
    if (!agenda.value) return null
    switch (cutoff.value.tone) {
      case 'sent':
      case 'sent-late':
        return { class: 'bg-green-600', label: 'enviada' }
      case 'late':
        return { class: 'bg-red-700', label: 'sin enviar, fuera de horario' }
      default:
        return { class: 'bg-amber-700', label: 'sin enviar' }
    }
  })

  return { canViewManagerAgenda, withoutAgenda, mark }
}
