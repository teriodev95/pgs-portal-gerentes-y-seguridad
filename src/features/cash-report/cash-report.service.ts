import { createApiClientFromPreset } from '@/shared/services/core'
import type { ReportDay } from './cash-report.constants'
import type {
  ApiEnvelope,
  CurrentCashReport,
  HistoricalCashReport,
  HourlyCashReport
} from './cash-report.types'

class CashReportService {
  private apiClient = createApiClientFromPreset('elysia')

  async getCurrent(branch: string): Promise<CurrentCashReport> {
    const { data } = await this.apiClient.get<ApiEnvelope<CurrentCashReport>>(
      `/reporte-direccion/${branch}/actual`
    )
    return data.data
  }

  async getHistory(branch: string, reportDay: ReportDay): Promise<HistoricalCashReport> {
    const { data } = await this.apiClient.get<ApiEnvelope<HistoricalCashReport>>(
      `/reporte-direccion/${branch}/historico`,
      {
        params: {
          reporte_del_dia: reportDay,
          semanas: 6
        }
      }
    )
    return data.data
  }

  async getTodayEvolution(branch: string): Promise<HourlyCashReport> {
    const { data } = await this.apiClient.get<ApiEnvelope<HourlyCashReport>>(
      `/reporte-direccion/${branch}/evolucion-hoy`
    )
    return data.data
  }
}

export const cashReportService = new CashReportService()

export function cashReportError(error: unknown): string {
  const response = (error as { response?: { data?: { message?: string; error?: string } } })?.response
  return response?.data?.message || response?.data?.error || 'No pudimos cargar el reporte. Intenta de nuevo.'
}
