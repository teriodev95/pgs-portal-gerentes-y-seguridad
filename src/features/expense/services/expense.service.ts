// ✅ Migrated to new service architecture
import { createApiClientFromPreset } from '@/shared/services/core'
import type { WeeklyExpense } from "../types"

class WeeklyExpenseService {
  private apiClient = createApiClientFromPreset('fastApi')

  async getWeeklyExpenses(userId: number, week: number, year: number) {
    return this.apiClient.get<WeeklyExpense[]>(`/gastos/gastos_by_usuario?usuario_id=${userId}&anio=${year}&semana=${week}`)
  }

  async createExpense(expense: WeeklyExpense) {
    return this.apiClient.post<string>(`/gastos/`, expense)
  }
}

export const weeklyExpenseService = new WeeklyExpenseService()