// ✅ Migrated to new service architecture
import { createApiClientFromPreset } from '@/shared/services/core'
import type { WeeklyExpense } from "../types"

class WeeklyExpenseService {
  private apiClient = createApiClientFromPreset('main')

  async getWeeklyExpenses(userId: number) {
    return this.apiClient.get<WeeklyExpense[]>(`/pwa/gastos/by_usuario_id/${userId}`)
  }

  async createExpense(expense: WeeklyExpense) {
    return this.apiClient.post<string>(`/pwa/gastos/create`, expense)
  }
}

export const weeklyExpenseService = new WeeklyExpenseService()