import { createApiClientFromPreset } from '@/shared/services/core'
import type { GetBaseProps,  } from '@/interfaces'
import type {
  IAgencyFinancialSummary,
  ILoansAboutToEnd,
  IManagementDashboard,
  IManagementDebts,
} from '../types'

class EntityService {
  private apiJavalin = createApiClientFromPreset('javalin')
  private apiFastApi = createApiClientFromPreset('fastApi')

  async getAgencyDashboard(agency: string, date: string) {
    return this.apiFastApi.get<IAgencyFinancialSummary>(`/dashboard-agencia-v3/dashboard/fecha?fecha=${date}&agencia=${agency}`)
  }
  
  async getNewGerencyDashboard(params: GetBaseProps) {
    return this.apiJavalin.get<IManagementDashboard>(
      `/dashboards/gerencia?gerencia=${params.managment}&anio=${params.year}&semana=${params.week}`
    )
  }

  async getLoansAboutToEnd({ agency, week, year }: GetBaseProps) {
    return this.apiFastApi.get<ILoansAboutToEnd>(`/prestamos/por_finalizar_by_agencia/?agencia=${agency}&anio=${year}&semana=${week}`)
  }


  async getManagementDebts(params: GetBaseProps) { 
    return this.apiJavalin.get<IManagementDebts>(`/debitos/gerencia?anio=${params.year}&semana=${params.week}&gerencia=${params.managment}`)
  }
}

export const entityService = new EntityService()