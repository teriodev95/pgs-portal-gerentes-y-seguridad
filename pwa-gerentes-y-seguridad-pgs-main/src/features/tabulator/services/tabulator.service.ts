// ✅ Migrated to new service architecture
import { createApiClientFromPreset } from '@/shared/services/core'
import type { GetBaseProps } from '@/interfaces'
import type { MoneyTabulation, TabulationFormData } from "../types"

class TabulationService {
  private apiClient = createApiClientFromPreset('main')

  async createMoneyTabulation(tabulation: MoneyTabulation) {
    return this.apiClient.post(`/pwa/tabulaciones/create`, tabulation)
  }

  async updateMoneyTabulation(
    tabulation: TabulationFormData,
    { managment, year, week }: GetBaseProps
  ) {
    return this.apiClient.put(
      `/pwa/tabulaciones/update/gerencia/${managment}/anio/${year}/semana/${week}`,
      tabulation
    )
  }

  async getMoneyTabulation({ managment, year, week }: GetBaseProps) {
    return this.apiClient.get<MoneyTabulation | { result: string }>(
      `/pwa/tabulaciones/gerencia/${managment}/anio/${year}/semana/${week}`
    )
  }
}

export const tabulationService = new TabulationService()