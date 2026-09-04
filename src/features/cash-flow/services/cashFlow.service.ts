import { createApiClientFromPreset } from '@/shared/services/core'
import type { FlujoEfectivoResponse } from '../types/cashFlow.types'

class CashFlowService {
  private apiClient = createApiClientFromPreset('elysia')

  async getFlujo(gerencia: string, anio: number, semana: number) {
    return this.apiClient.get<FlujoEfectivoResponse>(
      `/flujo-efectivo/${gerencia}/${anio}/${semana}`,
      {
        meta: {
          errorNotification: {
            title: 'Error al cargar el flujo',
            message: 'No se pudo cargar el flujo de efectivo. Intenta nuevamente.',
            type: 'error',
          },
        },
      },
    )
  }
}

export const cashFlowService = new CashFlowService()
