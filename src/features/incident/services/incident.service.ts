import { createApiClientFromPreset } from '@/shared/services/core'
import type { GetBaseProps } from '@/interfaces'
import type { IIncident } from '../types'

class IncidentService {
  private apiClient = createApiClientFromPreset('main')

  async getIncidentByUserId({ year, week, userID }: GetBaseProps) {
    return this.apiClient.get<IIncident[]>(`/pwa/incidentes-reposiciones/usuarioId/${userID}/anio/${year}/semana/${week}`)
  }

  async createIncident(incident: IIncident) {
    return this.apiClient.post(`/pwa/incidentes-reposiciones/create-one`, incident)
  }
}

export const incidentService = new IncidentService()
