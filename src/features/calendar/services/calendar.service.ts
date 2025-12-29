import { createApiClientFromPreset } from '@/shared/services/core'
import type { CalendarResponse } from '../types'

class CalendarService {
  private apiClient = createApiClientFromPreset('elysia')

  async getCalendarByYear(year: number): Promise<CalendarResponse> {
    const response = await this.apiClient.get<CalendarResponse>(`calendario?anio=${year}`)
    return response.data
  }
}

export const calendarService = new CalendarService()