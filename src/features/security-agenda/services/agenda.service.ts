import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  Agenda,
  AgendaActivity,
  AgendaActivityPayload,
  AgendaActivityType,
  AgendaPublic,
  AgendaScope,
  AgendaSendResult,
  AgendaShareLink,
  AgendaSummary,
  AgendaTeamMember
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

  async getAgenda(id: string): Promise<Agenda> {
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

  async updateActivity(
    id: string,
    payload: Partial<AgendaActivityPayload>
  ): Promise<AgendaActivity> {
    const { data } = await this.apiClient.put<ApiEnvelope<AgendaActivity>>(
      `${this.base}/actividades/${id}`,
      payload
    )
    return data.data
  }

  async deleteActivity(id: string): Promise<void> {
    await this.apiClient.delete(`${this.base}/actividades/${id}`)
  }

  async send(id: string): Promise<AgendaSendResult> {
    const { data } = await this.apiClient.post<ApiEnvelope<AgendaSendResult>>(
      `${this.base}/${id}/enviar`
    )
    return data.data
  }

  async share(id: string, rotar = false): Promise<AgendaShareLink> {
    const { data } = await this.apiClient.post<ApiEnvelope<AgendaShareLink>>(
      `${this.base}/${id}/compartir`,
      { rotar }
    )
    return data.data
  }

  async revokeShare(id: string): Promise<void> {
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
