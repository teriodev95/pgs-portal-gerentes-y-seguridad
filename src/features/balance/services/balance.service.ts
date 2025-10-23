import { createApiClientFromPreset } from '@/shared/services/core'
import type { IBalance } from '../types'

class BalanceService {
  private apiClient = createApiClientFromPreset('main')

  async getBalance(userId: number, managmetent: string, year: number, week: number) {
    return this.apiClient.get<IBalance>(
      `/pwa/cierres_semanales/asignaciones_y_gastos/by_usuario-id_gerencia_anio_and_semana/${userId}/${managmetent}/${year}/${week}`
    )
  }
}

export const balanceService = new BalanceService()