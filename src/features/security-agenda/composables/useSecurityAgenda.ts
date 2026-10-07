import { computed, ref } from 'vue'
import { useNotification } from '@/shared/composables/useNotification'
import { DONE_STATUSES } from '../constants'
import {
  agendaErrorMessage,
  agendaErrorStatus,
  securityAgendaService
} from '../services/agenda.service'
import { todayISO } from '../utils/time'
import type {
  Agenda,
  AgendaActivityChanges,
  AgendaActivityPayload,
  AgendaActivityType,
  AgendaScope,
  AgendaShareLink,
  AgendaTeamMember
} from '../types'

/**
 * Agenda de un día: la del usuario en sesión, la de un auditor a cargo o, con
 * `managerGerencia`, la del gerente de esa gerencia (sólo lectura).
 *
 * `GET /` devuelve el resumen del día y `GET /:id` la agenda completa: son dos
 * llamadas porque el contrato no expone la agenda completa por fecha.
 */
export function useSecurityAgenda(managerGerencia?: string) {
  const { showError } = useNotification()

  const fecha = ref(todayISO())
  /** `undefined` = mi agenda; con valor = agenda de un auditor del equipo. */
  const auditorId = ref<number | undefined>()

  const agenda = ref<Agenda | null>(null)
  /** Gerente consultado; `null` también cuando la gerencia está vacante. */
  const manager = ref<AgendaTeamMember | null>(null)
  const activityTypes = ref<AgendaActivityType[]>([])
  const scope = ref<AgendaScope>({ gerencias: [] })

  const loading = ref(false)
  const saving = ref(false)
  const loadError = ref('')
  /**
   * 403: el perfil no alcanza. Es alcanzable de verdad —un Regional con
   * gerencias que no es responsable de seguridad ve la entrada del menú—, y
   * ahí no hay nada que reintentar ni que enviar.
   */
  const denied = ref(false)

  const activities = computed(() => agenda.value?.actividades ?? [])
  /** Las que entran al avance: la comida se agenda pero no cuenta. */
  const countable = computed(() =>
    activities.value.filter((activity) => activity.cuentaEnCumplimiento !== false)
  )
  const completed = computed(
    () => countable.value.filter((activity) => DONE_STATUSES.includes(activity.status)).length
  )
  const isSent = computed(() => agenda.value?.status === 'enviada')
  const canSend = computed(() => activities.value.length > 0 && !isSent.value)

  async function loadCatalogs() {
    try {
      const [types, userScope] = await Promise.all([
        securityAgendaService.getActivityTypes(),
        securityAgendaService.getScope()
      ])
      activityTypes.value = types
      scope.value = userScope
    } catch (error) {
      showError(agendaErrorMessage(error, 'No pudimos cargar el catálogo de actividades.'))
    }
  }

  async function load() {
    loading.value = true
    loadError.value = ''
    denied.value = false

    try {
      if (managerGerencia) {
        // `GET /` sólo lista la agenda propia: la del gerente se encuentra por su gerencia.
        const [member] = await securityAgendaService.getTeam(fecha.value, {
          rol: 'gerentes',
          gerencia: managerGerencia
        })
        manager.value = member ?? null
        agenda.value = member?.agenda ? await securityAgendaService.getAgenda(member.agenda.id) : null
      } else {
        const [summary] = await securityAgendaService.listAgendas(fecha.value, auditorId.value)
        agenda.value = summary ? await securityAgendaService.getAgenda(summary.id) : null
      }
    } catch (error) {
      agenda.value = null
      loadError.value = agendaErrorMessage(error, 'No pudimos cargar la agenda.')
      denied.value = agendaErrorStatus(error) === 403
    } finally {
      loading.value = false
    }
  }

  /** La primera actividad del día crea la agenda en el backend. */
  async function createActivity(payload: Omit<AgendaActivityPayload, 'fecha'>): Promise<boolean> {
    saving.value = true
    try {
      await securityAgendaService.createActivity({
        ...payload,
        fecha: fecha.value,
        auditorId: auditorId.value
      })
      await load()
      return true
    } catch (error) {
      showError(agendaErrorMessage(error, 'No pudimos guardar la actividad.'))
      return false
    } finally {
      saving.value = false
    }
  }

  async function updateActivity(id: number, payload: AgendaActivityChanges): Promise<boolean> {
    saving.value = true
    try {
      await securityAgendaService.updateActivity(id, payload)
      await load()
      return true
    } catch (error) {
      showError(agendaErrorMessage(error, 'No pudimos actualizar la actividad.'))
      return false
    } finally {
      saving.value = false
    }
  }

  async function deleteActivity(id: number): Promise<boolean> {
    saving.value = true
    try {
      await securityAgendaService.deleteActivity(id)
      await load()
      return true
    } catch (error) {
      showError(agendaErrorMessage(error, 'No pudimos eliminar la actividad.'))
      return false
    } finally {
      saving.value = false
    }
  }

  async function send(): Promise<boolean> {
    if (!agenda.value) return false

    saving.value = true
    try {
      const result = await securityAgendaService.send(agenda.value.id)
      agenda.value = {
        ...agenda.value,
        status: result.status,
        enviadaAt: result.enviadaAt,
        enviadaATiempo: result.enviadaATiempo
      }
      return true
    } catch (error) {
      showError(agendaErrorMessage(error, 'No pudimos enviar la agenda.'))
      return false
    } finally {
      saving.value = false
    }
  }

  async function share(rotar = false): Promise<AgendaShareLink | null> {
    if (!agenda.value) return null

    saving.value = true
    try {
      const link = await securityAgendaService.share(agenda.value.id, rotar)
      agenda.value = { ...agenda.value, shareToken: link.token, shareUrl: link.url }
      return link
    } catch (error) {
      showError(agendaErrorMessage(error, 'No pudimos generar el enlace.'))
      return null
    } finally {
      saving.value = false
    }
  }

  async function revokeShare(): Promise<boolean> {
    if (!agenda.value) return false

    saving.value = true
    try {
      await securityAgendaService.revokeShare(agenda.value.id)
      agenda.value = { ...agenda.value, shareToken: null, shareUrl: null }
      return true
    } catch (error) {
      showError(agendaErrorMessage(error, 'No pudimos revocar el enlace.'))
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    // Estado
    fecha,
    auditorId,
    agenda,
    manager,
    activityTypes,
    scope,
    loading,
    saving,
    loadError,
    denied,

    // Computed
    activities,
    countable,
    completed,
    isSent,
    canSend,

    // Métodos
    loadCatalogs,
    load,
    createActivity,
    updateActivity,
    deleteActivity,
    send,
    share,
    revokeShare
  }
}
