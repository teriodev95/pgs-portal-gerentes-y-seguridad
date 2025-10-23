import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  IGeneralBalance,
  IManagementNumbers,
  IWeeklyDetails
} from '@/interfaces'

class WeeklyDetailsService {
  private mainV2Client = createApiClientFromPreset('mainV2')
  private fastApiClient = createApiClientFromPreset('fastApi')
  private readonly STATIC_TOKEN = 'c4u&S7HizL5!PU$5c2gwYastgMs5%RUViAbK'

  async getGeneralBalance(management: string) {
    return this.mainV2Client.get<IGeneralBalance>(
      `/detalles-cierres-agencias/gerencia/${management}`,
      {
        headers: {
          staticToken: this.STATIC_TOKEN
        }
      }
    )
  }

  async getManagementNumbers(management: string) {
    return this.mainV2Client.get<IManagementNumbers>(
      `/numeros-gerencias/gerencia/${management}`,
      {
        headers: {
          staticToken: this.STATIC_TOKEN
        }
      }
    )
  }

  async getWeeklyDetails(management: string, week: number, anio: number) {
    return this.fastApiClient.get<IWeeklyDetails>(
      `/detalles-cierre/detalles-cierre/V2/${management}/${anio}/${week}`
    )
  }
}

export const weeklyDetailsService = new WeeklyDetailsService()