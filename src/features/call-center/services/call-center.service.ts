import { createApiClientFromPreset } from '@/shared/services/core'
import type { ICallCenterVisit } from '../types'
import type { GetBaseProps } from '@/interfaces'

class CallCenterService {
  private faxClient = createApiClientFromPreset('fastApi')

  async createVisit(visita: ICallCenterVisit, clientName: string) {
    return this.faxClient.post(`/visitas/call-center`, visita, {
      meta: {
        successNotification: {
          mainText: 'Visita registrada x',
          secondaryText: `Se guardó con éxito la visita al cliente ${clientName}`
        }
      }
    })
  }

  async getCallCenterReports({managment, year, week}: GetBaseProps) {
    return this.faxClient.get(`/call-center/reportes?gerencia=${managment}&anio=${year}&semana=${week}`)
  }

  async getSummaryReportsByManagement(userId: number) {
    return this.faxClient.get(`/call-center/reportes-por-gerencia?usuario_id=${userId}`)
  }

  async searchReportByName(name: string, userId: number) {
    return this.faxClient.get(`/call-center/buscar?busqueda=${name}&usuario_id=${userId}&limit=20`)
  }
}

export const callCenterService = new CallCenterService()