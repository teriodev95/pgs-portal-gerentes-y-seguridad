// ✅ Migrated to new service architecture
import { createApiClientFromPreset } from '@/shared/services/core'
import type { PinResponse, ManagementPinsResponse } from "../types"

class SecurityPinService {
  private apiClient = createApiClientFromPreset('fastApi')

  async createPin(management: string) {
    return this.apiClient.post<PinResponse>(`/pin/generate/${management}`)
  }

  async checkPinExists(management: string) {
    return this.apiClient.get<ManagementPinsResponse>(`/pin/gerencia/${management}`)
  }
}

export const securityPinService = new SecurityPinService()
