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
    return this.apiFastApi.get<IAgencyFinancialSummary>(`/dashboard-agencia-v3/dashboard/fecha?fecha=${date}&agencia=${agency}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar dashboard de agencia',
          message: 'No se pudo cargar la información del dashboard. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getNewGerencyDashboard(params: GetBaseProps) {
    return this.apiJavalin.get<IManagementDashboard>(
      `/dashboards/gerencia?gerencia=${params.managment}&anio=${params.year}&semana=${params.week}`,
      {
        meta: {
          errorNotification: {
            title: 'Error al cargar dashboard de gerencia',
            message: 'No se pudo cargar la información de la gerencia. Por favor, intenta nuevamente.',
            type: 'error'
          }
        }
      }
    )
  }

  async getLoansAboutToEnd({ agency, week, year }: GetBaseProps) {
    return this.apiFastApi.get<ILoansAboutToEnd>(`/prestamos/por_finalizar_by_agencia/?agencia=${agency}&anio=${year}&semana=${week}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar préstamos por finalizar',
          message: 'No se pudieron cargar los préstamos próximos a finalizar. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }


  async getManagementDebts(params: GetBaseProps) {
    return this.apiJavalin.get<IManagementDebts>(`/debitos/gerencia?anio=${params.year}&semana=${params.week}&gerencia=${params.managment}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar débitos de gerencia',
          message: 'No se pudieron cargar los débitos de la gerencia. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const entityService = new EntityService()