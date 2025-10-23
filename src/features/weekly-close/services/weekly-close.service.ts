import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  IBonusDetails,
  ICreateCierreSemana,
  IFastWeeklyClose,
  IUploadVideoResponse,
} from '@/features/weekly-close/types'


class WeeklyClosingService {
  private fastApiClient = createApiClientFromPreset('fastApi')
  private uploadVideoClient = createApiClientFromPreset('workerUploadVideo')
  private javalinClient = createApiClientFromPreset('javalin')

  async getWeeklyClose(week: number, anio: number, gerencia: string, agencia: string) {
    return this.fastApiClient.get<IFastWeeklyClose[]>(
      `/cierres-agencias/?semana=${week}&anio=${anio}&gerencia=${gerencia}&agencia=${agencia}`
    )
  }

  async createWeeklyClose(data: ICreateCierreSemana) {
    return this.fastApiClient.post(`/cierres-agencias/`, data)
  }

  async uploadVideo(video: File) {
    const formData = new FormData()
    formData.append('video', video)
    return this.uploadVideoClient.post<IUploadVideoResponse>('/upload', formData)
  }

  async getBonusInfo(mes: string, anio: number, agencia: string) {
    return this.javalinClient.get<IBonusDetails>(`/bonos/reporte?agencia=${agencia}&anio=${anio}&mes=${mes}`)
  }
}

export const weeklyClosingService = new WeeklyClosingService()