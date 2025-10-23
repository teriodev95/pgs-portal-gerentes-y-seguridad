import { createApiClientFromPreset } from '@/shared/services/core'
import type { SaleDetails } from "../types"

class SalesService {
  private apiClient = createApiClientFromPreset('main')

  async createSale(sale: SaleDetails) {
    return this.apiClient.post(`/ventas/create`, sale)
  }

  async getSales(managment: string, year: number, week: number) {
    return this.apiClient.get<SaleDetails[]>(`/ventas/by_gerencia_anio_and_semana/${managment}/${year}/${week}`)
  }
}

export const salesService = new SalesService()
