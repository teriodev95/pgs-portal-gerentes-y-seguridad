import { createApiClientFromPreset } from '@/shared/services/core'
import type { GetBaseProps,  } from '@/interfaces'
import type {
  IAgencyFinancialSummary,
  ILoansAboutToEnd,
  IManagementDashboardData,
  IManagementDashboard,
  IManagementDebts,
} from '../types'

class EntityService {
  private apiClient = createApiClientFromPreset('main')
  private apiJavalin = createApiClientFromPreset('javalin')

  async getAgencyDashboard(agency: string, date: string) {
    return this.apiClient.get<IAgencyFinancialSummary>(`/pwa/dashboard-fecha/${agency}/${date}`)
  }

  async getGerencyDashboard(params: GetBaseProps) {
    return this.apiClient.get<IManagementDashboardData>(
      `/dashboard-gerencia/${params.managment}/${params.year}/${params.week}`
    )
  }
  
  async getNewGerencyDashboard(params: GetBaseProps) {
    return this.apiJavalin.get<IManagementDashboard>(
      `/dashboards/gerencia?gerencia=${params.managment}&anio=${params.year}&semana=${params.week}`
    )
  }

  async getLoansAboutToEnd({ agency, week, year }: GetBaseProps) {
    return this.apiClient.get<ILoansAboutToEnd>(`/loans/por_finalizar_by_agencia/${agency}/${year}/${week}`)
  }


  async getManagementDebts(params: GetBaseProps) { 
    return this.apiJavalin.get<IManagementDebts>(`/debitos/gerencia?anio=${params.year}&semana=${params.week}&gerencia=${params.managment}`)
  }
}

export const entityService = new EntityService()