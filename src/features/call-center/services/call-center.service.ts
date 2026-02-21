import { createApiClientFromPreset } from '@/shared/services/core'
import type { ICallCenterVisit } from '../types'
import type { GetBaseProps } from '@/interfaces'

class CallCenterService {
  private faxClient = createApiClientFromPreset('fastApi')

  async createVisit(visita: ICallCenterVisit) {
    return this.faxClient.post(`/visitas/call-center`, visita)
  }

  async getCallCenterReports({managment, year, week}: GetBaseProps) {
    return this.faxClient.get(`/call-center/reportes?gerencia=${managment}&anio=${year}&semana=${week}`)
  }

  async getSummaryReportsByManagement(userId: number) {
    return this.faxClient.get(`/call-center/reportes-por-gerencia?usuario_id=${userId}`)
  }

  async searchReportByName(name: string) {
    return this.faxClient.get(`/call-center/reportes/buscar?nombre=${name}`)
  }
}

export const callCenterService = new CallCenterService()