import { createApiClientFromPreset } from '@/shared/services/core'
import type { CashFlowResponse } from '../types/cashFlow.types'

class CashFlowService {
  private apiClient = createApiClientFromPreset('elysia')

  async getMovimientos(gerencia: string, anio: number, semana: number) {
    return this.apiClient.get<CashFlowResponse>(
      `/movimientos-efectivo/${gerencia}/${anio}/${semana}`,
      {
        meta: {
          errorNotification: {
            title: 'Error al cargar movimientos',
            message: 'No se pudieron cargar los movimientos de efectivo. Por favor, intenta nuevamente.',
            type: 'error'
          }
        }
      }
    )
  }
}

export const cashFlowService = new CashFlowService()
