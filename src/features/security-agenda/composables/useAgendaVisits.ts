import { ref } from 'vue'
import { useNotification } from '@/shared/composables/useNotification'
import { useStore } from '@/shared/stores'
import { callCenterService } from '@/features/call-center/services/call-center.service'
import { securityAgendaService } from '../services/agenda.service'
import { parseVisitDetail, type VisitTarget } from '../utils/visit'
import type { AgendaActivity } from '../types'

/** Lo que la hoja de visita del call center entrega al registrar. */
export interface VisitFormPayload {
  observaciones: string
  status: string
  lat: number
  lng: number
}

/**
 * Visitas de call center dentro de la agenda.
 *
 * La visita se registra en FAX —el mismo endpoint y el mismo servicio que usa
 * el módulo de call center— y la agenda sólo guarda el `visitaId`. Son dos
 * sistemas: que la liga falle no deshace la visita, y esa asimetría manda en
 * todos los mensajes de aquí.
 */
export function useAgendaVisits() {
  const $store = useStore()
  const { showError, showWarning } = useNotification()

  const busy = ref(false)

  /**
   * Registra la visita en FAX y la liga a la actividad. Devuelve `true` en
   * cuanto la visita quedó registrada, aunque la liga falle: para el auditor
   * eso ya está hecho y no se le puede presentar como un error.
   */
  async function registerVisit(activity: AgendaActivity, form: VisitFormPayload): Promise<boolean> {
    const target = parseVisitDetail(activity.detalle)
    if (!target) {
      showError('Esta actividad no trae el préstamo del cliente. Agéndala desde el reporte del call center.')
      return false
    }

    busy.value = true
    let visitaId = ''

    try {
      visitaId = await createFaxVisit(target, form)
    } catch {
      // El servicio de FAX ya abrió su propio diálogo de error.
      busy.value = false
      return false
    }

    try {
      if (!visitaId) throw new Error('La respuesta no trae visitaId')
      await securityAgendaService.updateActivity(activity.id, { visitaId })
    } catch {
      showWarning('Registramos la visita, pero quedó sin ligar a tu agenda.')
    } finally {
      busy.value = false
    }

    return true
  }

  async function createFaxVisit(target: VisitTarget, form: VisitFormPayload): Promise<string> {
    const { data } = await callCenterService.createVisit(
      {
        log: {
          creada_por: $store.user?.usuarioId || 0,
          observaciones: form.observaciones,
          status: form.status
        },
        lat: form.lat,
        lng: form.lng,
        prestamoId: target.prestamoId
      },
      target.cliente
    )
    return readVisitaId(data)
  }

  return {
    busy,
    registerVisit
  }
}

/**
 * FAX responde el id de la visita, pero ni el envoltorio ni el nombre exacto
 * están garantizados (`visitaId`, `visitaID`, `visita_id`).
 */
function readVisitaId(payload: unknown): string {
  const body = payload as Record<string, unknown> | null
  const source = (body?.data as Record<string, unknown>) || body
  if (!source) return ''

  const key = Object.keys(source).find((name) => /^visita_?id$/i.test(name))
  const value = key ? source[key] : undefined
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}
