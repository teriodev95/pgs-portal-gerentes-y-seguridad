import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  Agenda,
  AgendaActivity,
  AgendaActivityChanges,
  AgendaActivityPayload,
  AgendaActivityType,
  AgendaAgencyContact,
  AgendaPublic,
  AgendaScope,
  AgendaSendResult,
  AgendaShareLink,
  AgendaSummary,
  AgendaTeamMember,
  AgendaUnlinkedVisit
} from '../types'

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

/**
 * Agendas de seguridad (xpress-elysia, prefijo `/agendas-seguridad`).
 * El preset `elysia` resuelve el baseURL por entorno e inyecta el Bearer
 * (usuario:pin) vía interceptor; `/publica/:token` funciona sin sesión.
 */
class SecurityAgendaService {
  private apiClient = createApiClientFromPreset('elysia')
  private readonly base = '/agendas-seguridad'

  async getActivityTypes(): Promise<AgendaActivityType[]> {
    const { data } = await this.apiClient.get<ApiEnvelope<AgendaActivityType[]>>(
      `${this.base}/actividades`
    )
    return data.data
  }

  async getScope(): Promise<AgendaScope> {
    const { data } = await this.apiClient.get<ApiEnvelope<AgendaScope>>(`${this.base}/mi-ambito`)
    return data.data
  }

  /**
   * Agente asignado a una agencia. `null` es respuesta válida —la plaza está
   * vacante— y no un fallo: quien llama distingue eso de un error de red.
   * Va con sesión, como el resto del prefijo salvo `/publica/:token`.
   */
  async getAgencyContact(agenciaId: string): Promise<AgendaAgencyContact | null> {
    const { data } = await this.apiClient.get<ApiEnvelope<AgendaAgencyContact | null>>(
      `${this.base}/agencias/${encodeURIComponent(agenciaId)}/contacto`
    )
    // Aquí `null` significa "agencia vacante" y se muestra como tal, así que un
    // cuerpo sin éxito no puede colarse como ausencia de agente: se levanta y la
    // tarjeta desaparece, que es lo que corresponde a un fallo.
    if (!data.success) throw new Error('No pudimos leer el contacto de la agencia')
    return data.data ?? null
  }

  async getTeam(fecha: string): Promise<AgendaTeamMember[]> {
    const { data } = await this.apiClient.get<ApiEnvelope<AgendaTeamMember[]>>(
      `${this.base}/equipo`,
      { params: { fecha } }
    )
    return data.data
  }

  async listAgendas(fecha: string, auditorId?: number): Promise<AgendaSummary[]> {
    const { data } = await this.apiClient.get<ApiEnvelope<AgendaSummary[]>>(this.base, {
      params: auditorId ? { fecha, auditorId } : { fecha }
    })
    return data.data
  }

  async getAgenda(id: number): Promise<Agenda> {
    const { data } = await this.apiClient.get<ApiEnvelope<Agenda>>(`${this.base}/${id}`)
    return data.data
  }

  async createActivity(payload: AgendaActivityPayload): Promise<AgendaActivity> {
    const { data } = await this.apiClient.post<ApiEnvelope<AgendaActivity>>(
      `${this.base}/actividades`,
      payload
    )
    return data.data
  }

  async updateActivity(id: number, payload: AgendaActivityChanges): Promise<AgendaActivity> {
    const { data } = await this.apiClient.put<ApiEnvelope<AgendaActivity>>(
      `${this.base}/actividades/${id}`,
      payload
    )
    return data.data
  }

  /** Visitas del día que el auditor registró fuera de su agenda. */
  async getUnlinkedVisits(fecha: string): Promise<AgendaUnlinkedVisit[]> {
    const { data } = await this.apiClient.get<ApiEnvelope<AgendaUnlinkedVisit[]>>(
      `${this.base}/visitas-sin-ligar`,
      { params: { fecha } }
    )
    return data.data
  }

  async deleteActivity(id: number): Promise<void> {
    await this.apiClient.delete(`${this.base}/actividades/${id}`)
  }

  async send(id: number): Promise<AgendaSendResult> {
    const { data } = await this.apiClient.post<ApiEnvelope<AgendaSendResult>>(
      `${this.base}/${id}/enviar`
    )
    return data.data
  }

  async share(id: number, rotar = false): Promise<AgendaShareLink> {
    const { data } = await this.apiClient.post<ApiEnvelope<AgendaShareLink>>(
      `${this.base}/${id}/compartir`,
      { rotar }
    )
    return data.data
  }

  async revokeShare(id: number): Promise<void> {
    await this.apiClient.delete(`${this.base}/${id}/compartir`)
  }

  /**
   * Módulos habilitados del usuario. Vive fuera del prefijo de agendas
   * (`/permisos`), pero sólo esta feature lo consume: la pestaña "Mi equipo".
   */
  async getUserModules(usuarioId: number): Promise<unknown[]> {
    const { data } = await this.apiClient.get<ApiEnvelope<unknown[]>>(
      `/permisos/usuario/${usuarioId}`
    )
    return Array.isArray(data.data) ? data.data : []
  }

  async getPublicAgenda(token: string): Promise<AgendaPublic> {
    const { data } = await this.apiClient.get<ApiEnvelope<AgendaPublic>>(
      `${this.base}/publica/${token}`
    )
    return data.data
  }
}

export const securityAgendaService = new SecurityAgendaService()

/**
 * Los errores del backend vienen redactados en español: se muestran tal cual.
 * El fallback sólo cubre fallos de red donde no hay cuerpo de respuesta.
 */
export function agendaErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { error?: string; message?: string } } })?.response
  return response?.data?.error || response?.data?.message || fallback
}

export function agendaErrorStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } })?.response?.status
}
