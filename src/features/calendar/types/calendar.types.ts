export interface CalendarWeek {
  id: number
  semana: number
  mes: string
  anio: number
  desde: string
  hasta: string
  pago_bono: boolean
}

export interface CalendarResponse {
  success: boolean
  message: string
  data: CalendarWeek[]
}

export interface MonthGroup {
  month: string
  weeks: CalendarWeek[]
  weekCount: number
}

export type CalendarView = 'anual' | 'mensual'

export interface CalendarFilters {
  year: number
  view: CalendarView
}