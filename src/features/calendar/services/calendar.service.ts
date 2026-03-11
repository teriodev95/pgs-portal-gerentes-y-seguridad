import { createApiClientFromPreset } from '@/shared/services/core'
import type { CalendarResponse } from '../types'

class CalendarService {
  private apiClient = createApiClientFromPreset('elysia')

  async getCalendarByYear(year: number): Promise<CalendarResponse> {
    const response = await this.apiClient.get<CalendarResponse>(`ncalendario?anio=${year}`, {
      meta: {
        errorNotification: {
          title: 'Error al obtener calendario',
          message: 'No se pudo cargar el calendario del año especificado. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
    return response.data
  }
}

export const calendarService = new CalendarService()