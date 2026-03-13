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
        },
        errorNotification: {
          title: 'Error al registrar visita',
          message: 'No se pudo registrar la visita. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getCallCenterReports({managment, year, week}: GetBaseProps) {
    return this.faxClient.get(`/call-center/reportes?gerencia=${managment}&anio=${year}&semana=${week}`, {
      meta: {
        errorNotification: {
          title: 'Error al obtener reportes de call center',
          message: 'No se pudieron cargar los reportes. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getSummaryReportsByManagement(userId: number) {
    return this.faxClient.get(`/call-center/reportes-por-gerencia?usuario_id=${userId}`, {
      meta: {
        errorNotification: {
          title: 'Error al obtener resumen de reportes',
          message: 'No se pudo cargar el resumen de reportes por gerencia. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async searchReportByName(name: string, userId: number) {
    return this.faxClient.get(`/call-center/buscar?busqueda=${name}&usuario_id=${userId}&limit=20`, {
      meta: {
        errorNotification: {
          title: 'Error al buscar reporte',
          message: 'No se pudo realizar la búsqueda. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const callCenterService = new CallCenterService()