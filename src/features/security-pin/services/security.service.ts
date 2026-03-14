// ✅ Migrated to new service architecture
import { createApiClientFromPreset } from '@/shared/services/core'
import type { PinResponse, ManagementPinsResponse } from "../types"

class SecurityPinService {
  private apiClient = createApiClientFromPreset('fastApi')

  async createPin(management: string) {
    return this.apiClient.post<PinResponse>(`/pin/generate/${management}`, undefined, {
      meta: {
        errorNotification: {
          title: 'Error al generar PIN',
          message: 'No se pudo generar el PIN de seguridad. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async checkPinExists(management: string) {
    return this.apiClient.get<ManagementPinsResponse>(`/pin/gerencia/${management}`, {
      meta: {
        errorNotification: {
          title: 'Error al verificar PIN',
          message: 'No se pudo verificar la existencia del PIN. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const securityPinService = new SecurityPinService()
