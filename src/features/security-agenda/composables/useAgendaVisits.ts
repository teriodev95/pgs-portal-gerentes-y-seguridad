import { ref, type Ref } from 'vue'
import { useNotification } from '@/shared/composables/useNotification'
import { useStore } from '@/shared/stores'
import { callCenterService } from '@/features/call-center/services/call-center.service'
import {
  DAY_END_HOUR,
  SLOT_MINUTES,
  VISIT_ACTIVITY_TYPE,
  VISIT_DURATION_MINUTES
} from '../constants'
import {
  agendaErrorMessage,
  agendaErrorStatus,
  securityAgendaService
} from '../services/agenda.service'
import { slotFromTimestamp, toHHMM, toMinutes } from '../utils/time'
import { buildVisitDetail, parseVisitDetail, type VisitTarget } from '../utils/visit'
import type { AgendaActivity, AgendaTimelineActivity, AgendaUnlinkedVisit } from '../types'

/** Lo que la hoja de visita del call center entrega al registrar. */
export interface VisitFormPayload {
  observaciones: string
  status: string
  lat: number
  lng: number
}

type Interval = [number, number]

/**
 * Visitas de call center dentro de la agenda.
 *
 * La visita se registra en FAX —el mismo endpoint y el mismo servicio que usa
 * el módulo de call center— y la agenda sólo guarda el `visitaId`. Son dos
 * sistemas: que la liga falle no deshace la visita, y esa asimetría manda en
 * todos los mensajes de aquí.
 */
export function useAgendaVisits(fecha: Ref<string>, enabled: Ref<boolean>) {
  const $store = useStore()
  const { showError, showWarning } = useNotification()

  /** Visitas del día registradas fuera de la agenda. */
  const pending = ref<AgendaUnlinkedVisit[]>([])
  const busy = ref(false)

  /**
   * El aviso de visitas sueltas es un extra: si el endpoint falla, la agenda
   * sigue funcionando sin él y sin ruido.
   */
  async function loadPending() {
    if (!enabled.value) {
      pending.value = []
      return
    }

    try {
      pending.value = await securityAgendaService.getUnlinkedVisits(fecha.value)
    } catch {
      pending.value = []
    }
  }

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
      showWarning('Registramos la visita, pero quedó sin ligar a tu agenda. Agrégala desde el aviso de visitas sin ligar.')
      await loadPending()
    } finally {
      busy.value = false
    }

    return true
  }

  /**
   * Mete a la agenda las visitas que ya se registraron, sin abrir formulario.
   * Devuelve cuántas entraron para que la vista recargue una sola vez.
   */
  async function addPendingToAgenda(current: AgendaTimelineActivity[]): Promise<number> {
    if (!pending.value.length) return 0

    busy.value = true
    // Ocupación conocida: evita pedirle al backend bloques que ya sabemos llenos.
    const taken: Interval[] = current.map((activity) => [
      toMinutes(activity.horaInicio),
      toMinutes(activity.horaFin)
    ])
    let added = 0

    try {
      for (const visita of [...pending.value]) {
        const created = await addVisit(visita, taken)
        if (!created) break

        added++
        taken.push([toMinutes(created.horaInicio), toMinutes(created.horaFin)])
      }
    } finally {
      busy.value = false
    }

    await loadPending()
    return added
  }

  /** Un bloque de 30 min a la hora de la visita, o el siguiente que quepa. */
  async function addVisit(
    visita: AgendaUnlinkedVisit,
    taken: Interval[]
  ): Promise<AgendaActivity | null> {
    for (const inicio of slotCandidates(visita.fecha)) {
      const fin = inicio + VISIT_DURATION_MINUTES
      if (taken.some(([from, to]) => inicio < to && fin > from)) continue

      let activity: AgendaActivity
      try {
        activity = await securityAgendaService.createActivity({
          fecha: fecha.value,
          tipo: VISIT_ACTIVITY_TYPE,
          detalle: buildVisitDetail(visita.cliente, visita.prestamoId),
          horaInicio: toHHMM(inicio),
          horaFin: toHHMM(fin),
          prioridad: 'media'
        })
      } catch (error) {
        // 409 es el traslape —el bloque se ocupó desde otro lado—: corre al
        // siguiente. Los 400 (agenda llena, jornada, fecha pasada) valen igual en
        // cualquier hora, así que reintentarlos sólo repetiría la misma negativa.
        if (agendaErrorStatus(error) === 409) continue
        showError(agendaErrorMessage(error, 'No pudimos agregar la visita a tu agenda.'))
        return null
      }

      // La actividad ya existe: si la liga falla no se reintenta en otro bloque,
      // se diría dos veces lo mismo y quedarían dos actividades.
      try {
        await securityAgendaService.updateActivity(activity.id, { visitaId: visita.visitaId })
      } catch (error) {
        showError(agendaErrorMessage(error, 'Agregamos la actividad, pero no pudimos ligar la visita.'))
      }

      return activity
    }

    showError('No queda un bloque libre en tu agenda para esta visita.')
    return null
  }

  /** Desde la hora de la visita hasta el cierre de la jornada. */
  function slotCandidates(timestamp: string): number[] {
    const first = toMinutes(slotFromTimestamp(timestamp, VISIT_DURATION_MINUTES))
    const last = DAY_END_HOUR * 60 - VISIT_DURATION_MINUTES

    const slots: number[] = []
    for (let minutes = first; minutes <= last; minutes += SLOT_MINUTES) slots.push(minutes)
    return slots
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
    pending,
    busy,
    loadPending,
    registerVisit,
    addPendingToAgenda
  }
}

/**
 * FAX responde el id de la visita, pero ni el envoltorio ni el nombre exacto
 * están garantizados (`visitaId`, `visitaID`, `visita_id`). Sin id, la visita
 * queda registrada y sin ligar, que es un caso que la agenda ya sabe resolver.
 */
function readVisitaId(payload: unknown): string {
  const body = payload as Record<string, unknown> | null
  const source = (body?.data as Record<string, unknown>) || body
  if (!source) return ''

  const key = Object.keys(source).find((name) => /^visita_?id$/i.test(name))
  const value = key ? source[key] : undefined
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}
