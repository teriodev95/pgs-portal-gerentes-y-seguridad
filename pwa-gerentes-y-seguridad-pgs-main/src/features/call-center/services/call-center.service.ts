import { createApiClientFromPreset } from '@/shared/services/core'
import type { ICallCenterReport, ICallCenterVisit } from '../types'

class CallCenterService {
  private apiClient = createApiClientFromPreset('main')

  async getReportesCallCenterBySeguridad(Username: string) {
    return this.apiClient.get<ICallCenterReport[]>(`/call_center/reportes/usuario/${Username}`)
  }

  async createVisitaCallCenter(visita: ICallCenterVisit) {
    return this.apiClient.post(`/call_center/visitas/create-one`, visita)
  }
}

export const callCenterService = new CallCenterService()