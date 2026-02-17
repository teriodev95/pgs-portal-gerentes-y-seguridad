// ✅ Migrated to new service architecture
import { createApiClientFromPreset } from '@/shared/services/core'
import type { GetBaseProps } from '@/interfaces'
import type { MoneyTabulation, TabulationFormData } from "../types"

class TabulationService {
  private faxClient = createApiClientFromPreset('fastApi')

  async createMoneyTabulation(tabulation: MoneyTabulation) {
    return this.faxClient.post(`/tabulaciones/`, tabulation)
  }

  async updateMoneyTabulation(
    tabulation: TabulationFormData, id: number
  ) {
    return this.faxClient.patch(
      `/tabulaciones/${id}`,
      tabulation
    )
  }

  async getMoneyTabulation({ managment, year, week }: GetBaseProps) {
    return this.faxClient.get<MoneyTabulation | { result: string }>(
      `/tabulaciones/?gerencia=${managment}&anio=${year}&semana=${week}`
    )
  }
}

export const tabulationService = new TabulationService()