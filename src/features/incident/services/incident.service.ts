import { createApiClientFromPreset } from '@/shared/services/core'
import type { GetBaseProps } from '@/interfaces'
import type { IIncident } from '../types'

class IncidentService {
  private apiFax = createApiClientFromPreset('fastApi')

  async getIncidentByUserId({ year, week, userID }: GetBaseProps) {
    return this.apiFax.get<IIncident[]>(`/incidentes-reposiciones/usuarioId?usuario_id=${userID}&anio=${year}&semana=${week}`)
  }

  async createIncident(incident: IIncident) {
    return this.apiFax.post(`/incidentes-reposiciones/`, incident)
  }
}

export const incidentService = new IncidentService()
