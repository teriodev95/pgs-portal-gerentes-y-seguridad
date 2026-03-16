import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  IBonusDetails,
  ICommissionReport,
  ICreateCierreSemana,
  IFastWeeklyClose,
  IUploadVideoResponse,
  IAgencyDashboard
} from '@/features/weekly-close/types'
import type { GetBaseProps } from '@/interfaces'
import { toCurrency } from '@/shared/utils'


class WeeklyClosingService {
  private fastApiClient = createApiClientFromPreset('fastApi')
  private uploadVideoClient = createApiClientFromPreset('workerUploadVideo')
  private apiJavalin = createApiClientFromPreset('javalin')

  async getAgentsIncome({ agency, year, week } : GetBaseProps) {
    return this.apiJavalin.get<IAgencyDashboard>(`/dashboards/agencia?agencia=${agency}&anio=${year}&semana=${week}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar ingresos de agentes',
          message: 'No se pudieron cargar los ingresos de los agentes. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  } 

  async getWeeklyClose(week: number, anio: number, gerencia: string, agencia: string) {
    return this.fastApiClient.get<IFastWeeklyClose[]>(
      `/cierres-agencias/?semana=${week}&anio=${anio}&gerencia=${gerencia}&agencia=${agencia}`,
      {
        meta: {
          errorNotification: {
            title: 'Error al cargar cierre semanal',
            message: 'No se pudo cargar la información del cierre semanal. Por favor, intenta nuevamente.',
            type: 'error'
          }
        }
      }
    )
  }

  async createWeeklyClose(data: ICreateCierreSemana, agencyName: string, managementName: string, onClose?: () => void) {
    const summaryList = [
      `Comisión por cobranza: ${toCurrency(data.comisionCobranzaPagadaEnSemana)}`,
      `Comisión por ventas: ${toCurrency(data.comisionVentasPagadaEnSemana)}`,
      `Bonos: ${toCurrency(data.bonosPagadosEnSemana)}`
    ]

    return this.fastApiClient.post(`/cierres-agencias/`, data, {
      meta: {
        successNotification: {
          mainText: 'Cierre semanal completado con éxito',
          secondaryText: `Agencia: <b>${agencyName}</b> - Gerencia: <b>${managementName}</b>`,
          subText: 'Resumen:',
          list: summaryList,
          onClose
        },
        errorNotification: {
          title: 'Error al crear cierre semanal',
          message: 'No se pudo completar el cierre semanal. Por favor, verifica los datos e intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async uploadVideo(video: File) {
    const formData = new FormData()
    formData.append('video', video)
    return this.uploadVideoClient.post<IUploadVideoResponse>('/upload', formData, {
      meta: {
        errorNotification: {
          title: 'Error al subir video',
          message: 'No se pudo subir el video. Por favor, verifica el archivo e intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getBonusInfo(mes: string, anio: number, agencia: string) {
    return this.apiJavalin.get<IBonusDetails>(`/bonos/reporte?agencia=${agencia}&anio=${anio}&mes=${mes}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar información de bonos',
          message: 'No se pudo cargar la información de bonos. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }


  async getCommission({ agency, year, week }: GetBaseProps) {
    return this.apiJavalin.get<ICommissionReport>(`https://javalin.xpress1.cc/api/comisiones/agencia/reporte?agencia=${agency}&anio=${year}&semana=${week}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar comisiones',
          message: 'No se pudo cargar el reporte de comisiones. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const weeklyClosingService = new WeeklyClosingService()