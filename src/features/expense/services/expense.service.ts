// ✅ Migrated to new service architecture
import { createApiClientFromPreset } from '@/shared/services/core'
import type { WeeklyExpense } from "../types"

class WeeklyExpenseService {
  private apiClient = createApiClientFromPreset('fastApi')

  async getWeeklyExpenses(userId: number, week: number, year: number) {
    return this.apiClient.get<WeeklyExpense[]>(`/gastos/gastos_by_usuario?usuario_id=${userId}&anio=${year}&semana=${week}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar gastos',
          message: 'No se pudieron cargar los gastos semanales. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async createExpense(expense: WeeklyExpense) {
    return this.apiClient.post<string>(`/gastos/`, expense, {
      meta: {
        successNotification: {
          mainText: '¡Gasto registrado!',
          secondaryText: 'El gasto se ha guardado correctamente'
        },
        errorNotification: {
          title: 'Error al registrar gasto',
          message: 'No se pudo registrar el gasto. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const weeklyExpenseService = new WeeklyExpenseService()