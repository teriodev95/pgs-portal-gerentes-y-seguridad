import { computed, ref } from 'vue'
import { useNotification } from '@/shared/composables/useNotification'
import { agendaErrorMessage, securityAgendaService } from '../services/agenda.service'
import { todayISO } from '../utils/time'
import type {
  Agenda,
  AgendaActivityChanges,
  AgendaActivityPayload,
  AgendaActivityType,
  AgendaScope,
  AgendaShareLink
} from '../types'

/**
 * Agenda de un día: la del usuario en sesión o la de un auditor a cargo.
 *
 * `GET /` devuelve el resumen del día y `GET /:id` la agenda completa: son dos
 * llamadas porque el contrato no expone la agenda completa por fecha.
 */
export function useSecurityAgenda() {
  const { showError } = useNotification()

  const fecha = ref(todayISO())
  /** `undefined` = mi agenda; con valor = agenda de un auditor del equipo. */
  const auditorId = ref<number | undefined>()

  const agenda = ref<Agenda | null>(null)
  const activityTypes = ref<AgendaActivityType[]>([])
  const scope = ref<AgendaScope>({ gerencias: [] })

  const loading = ref(false)
  const saving = ref(false)
  const loadError = ref('')

  const activities = computed(() => agenda.value?.actividades ?? [])
  const completed = computed(
    () => activities.value.filter((activity) => activity.status === 'completada').length
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

    try {
      const [summary] = await securityAgendaService.listAgendas(fecha.value, auditorId.value)
      agenda.value = summary ? await securityAgendaService.getAgenda(summary.id) : null
    } catch (error) {
      agenda.value = null
      loadError.value = agendaErrorMessage(error, 'No pudimos cargar la agenda.')
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
    activityTypes,
    scope,
    loading,
    saving,
    loadError,

    // Computed
    activities,
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
