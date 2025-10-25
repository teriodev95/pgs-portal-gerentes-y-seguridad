import { REPORT_CONFIG, SPANISH_DAYS } from '../constants'
import type { ReportParams, ReportType } from '../types'

interface ReportRequestPayload {
  gerenciaId: string
  semana: number
  anio: number
  reporteDia: string
}

class ReportService {
  private buildApiUrl(type: ReportType): string {
    return type === 'gerencia'
      ? REPORT_CONFIG.API_BASE + REPORT_CONFIG.API_MANAGEMENT_ENDPOINT
      : REPORT_CONFIG.API_BASE + REPORT_CONFIG.API_AGENCY_ENDPOINT
  }

  private getCurrentDayInSpanish(): string {
    const today = new Date()
    return SPANISH_DAYS[today.getDay()]
  }

  private createRequestPayload(params: ReportParams): ReportRequestPayload {
    return {
      gerenciaId: params.managementId,
      semana: params.week,
      anio: params.year,
      reporteDia: this.getCurrentDayInSpanish(),
    }
  }

  async generateReport(type: ReportType, params: ReportParams): Promise<Blob> {
    const requestPayload = this.createRequestPayload(params)
    const apiUrl = this.buildApiUrl(type)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        ...REPORT_CONFIG.REQUEST_HEADERS,
        'X-API-Key': REPORT_CONFIG.API_KEY,
      },
      body: JSON.stringify(requestPayload),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate ${type} report: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()

    if (blob.size === 0) {
      throw new Error('Received empty response from server')
    }

    return blob
  }

  generateFilename(type: ReportType, params: ReportParams, customFilename?: string): string {
    if (customFilename) {
      return customFilename
    }

    const typePrefix = 'reporte-diario'
    const timestamp = new Date().toISOString().split('T')[0]
    return `${typePrefix}-${type}-${params.managementId}-${params.year}-${params.week}-${timestamp}.png`
  }
}

export const reportService = new ReportService()