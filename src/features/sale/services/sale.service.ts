import { createApiClientFromPreset } from '@/shared/services/core'
import type { SaleDetails } from "../types"

class SalesService {
  private faxClient = createApiClientFromPreset('fastApi')

  async createSale(sale: SaleDetails) {
    return this.faxClient.post(`/ventas/`, sale)
  }

  async getSales(managment: string, year: number, week: number) {
    return this.faxClient.get<SaleDetails[]>(`/ventas/?gerencia=${managment}&anio=${year}&semana=${week}`)
  }
}

export const salesService = new SalesService()
