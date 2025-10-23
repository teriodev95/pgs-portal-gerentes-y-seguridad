import { createApiClientFromPreset } from '@/shared/services/core'
import type { Liquidacion } from '../types'

class SettlementsService {
  private apiClient = createApiClientFromPreset('main')

  async getLiquidacion(id: string) {
    return this.apiClient.get<Liquidacion>(`/pwa/payoffs/data/${id}`)
  }

  async createLiquidacion(data: Liquidacion) {
    return this.apiClient.post<string>(`/pwa/payoffs/create-one`, data)
  }
}

export const settlementsService = new SettlementsService()