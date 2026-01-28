import { createApiClientFromPreset } from '@/shared/services/core'
import type { IAgencyDashboard } from '@/shared/types'
import type {
  GetBaseProps,
  GetGerenciasUsuario,
  IAgencyBasicInfo,
  ICobranza,
} from '@/interfaces'

class CommonService {
  private apiClient = createApiClientFromPreset('main')
  private javalinClient = createApiClientFromPreset('javalin')
  private expenseImageClient = createApiClientFromPreset('workerUploadExpenseImage')
  private comisionClient = createApiClientFromPreset('n8nCreateComision')
  private faxClient = createApiClientFromPreset('fastApi')
  private elysiaClient = createApiClientFromPreset('elysia')

  async getAgency(params: GetBaseProps) {
    return this.javalinClient.get<IAgencyDashboard>(`/dashboards/agencia?agencia=${params.agency}&anio=${params.year}&semana=${params.week}`)
  }

  async getAgenciesCopy(gerencia: string) {
    return this.apiClient.get<IAgencyBasicInfo[]>(`/pwa/agencias?gerencia=${gerencia}`)
  }

  async getCobranza(params: GetBaseProps) {
    return this.elysiaClient.get<{ cobranza: ICobranza[] }>(
      `/pwa/cobranza/${params.agency}/${params.year}/${params.week}`
    )
  }

  async getGerenciesCopy(user: string) {
    return this.apiClient.get<GetGerenciasUsuario>(`/pwa/gerencias?usuario=${user}`)
  }

  async getCurrentDate() {
    return this.faxClient.get<{
      semana: number
      anio: number
      desde: string
      hasta: string
    }>('/calendario/actual')
  }

  async uploadExpenseImage(tipoGasto: string, usuarioID: number, imageBase64: string) {
    return this.expenseImageClient.post('', {
      tipoGasto,
      usuarioID,
      imageBase64
    })
  }

  async createComisionWithWorker(agency: string) {
    return this.comisionClient.post('', {
      agencia: agency
    })
  }
}

export const commonService = new CommonService()
