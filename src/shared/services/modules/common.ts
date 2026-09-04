import { createApiClientFromPreset } from '@/shared/services/core'
import type { IAgencyDashboard } from '@/shared/types'
import type {
  GetBaseProps,
  GetGerenciasUsuario,
  IAgencyBasicInfo,
  ICobranza,
} from '@/interfaces'

class CommonService {
  private javalinClient = createApiClientFromPreset('javalin')
  private expenseImageClient = createApiClientFromPreset('workerUploadExpenseImage')
  private faxClient = createApiClientFromPreset('fastApi')
  private elysiaClient = createApiClientFromPreset('elysia')

  async getAgency(params: GetBaseProps) {
    return this.javalinClient.get<IAgencyDashboard>(`/dashboards/agencia?agencia=${params.agency}&anio=${params.year}&semana=${params.week}`)
  }

  async getAgenciesCopy(gerencia: string) {
    return this.faxClient.get<IAgencyBasicInfo[]>(`/agencias/resumen?gerencia=${gerencia}`)
  }

  async getCobranza(params: GetBaseProps) {
    return this.elysiaClient.get<{ cobranza: ICobranza[] }>(
      `/pwa/cobranza/${params.agency}/${params.year}/${params.week}`
    )
  }

  /**
   * Qué gerencias de la lista ya cerraron la semana.
   *
   * Una sola petición para todo el riel: preguntar por gerencia haría N llamadas
   * cada vez que el auditor entra.
   */
  async getEstadoCierres(gerencias: string[], anio: number, semana: number) {
    return this.elysiaClient.get<{
      success: boolean
      data: { gerencia: string; cerrada: boolean; cerradoEn: string | null }[]
    }>('/cierres-gerencias/estado', {
      params: { gerencias: gerencias.join(','), anio, semana }
    })
  }

  async getGerenciesCopy(user: string) {
    return this.faxClient.get<GetGerenciasUsuario>(`/gerencias/por-sucursal?usuario=${user}`)
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
}

export const commonService = new CommonService()
