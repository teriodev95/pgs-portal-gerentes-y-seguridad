// Tipos base
export type CallStatus = 'Contestado' | 'No contestado'
export type VisitStatus = 'Completada' | 'Pendiente' | 'Cancelada'

// Enums para mejor tipado
export enum FilterType {
  ALL = 'all',
  BY_NAME = 'by_name',
  BY_MANAGEMENT = 'by_management',
  BY_WEEK = 'by_week',
  BY_YEAR = 'by_year'
}

export enum UIState {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  EMPTY = 'empty'
}

// Interfaces base
export interface IQuestion {
  pregunta: string
  respuesta: string
  puntuacion: number
}


export interface IUserLog {
  status: string
  observaciones: string
  creada_por: number
  fecha_creacion?: string
}

// Interfaces de dominio
export interface ICallCenterVisit {
  log: IUserLog
  lat: number
  lng: number
  prestamoId: string
}

export interface ICallCenterReport {
  // Identificación
  prestamoId: string
  
  // Información del cliente
  nombres_cliente: string
  nombres_aval: string
  nombre_atiende_cliente: string
  nombre_atiende_aval: string
  
  // Estado de llamadas
  num_llamadas_cliente: number
  num_llamadas_aval: number
  status_llamada_cliente: CallStatus
  status_llamada_aval: CallStatus
  
  // URLs de llamadas
  url_llamada_cliente: string
  url_llamada_aval: string
  
  // Observaciones
  observaciones_cliente: string
  observaciones_aval: string
  
  // Preguntas y respuestas
  preguntas_cliente: IQuestion[]
  preguntas_aval: IQuestion[]
  
  // Filtros organizacionales
  agencia: string
  gerencia: string
  semana: number
  anio: number
  
  // Estado del reporte
  reportar_seguridad: boolean
  tieneVisitas: boolean
}

// Interfaces para filtros
export interface ICallCenterFilters {
  name: string
  management: string
  week: number
  year: number
}

export interface IManagementCard {
  gerency: string
  week: number
  year: number
  count: number
  reportsWhitVisit: number // Mantener consistencia con el componente existente
}

// Interfaces para el estado de UI
export interface ICallCenterUIState {
  isLoading: boolean
  isManagementSelected: boolean
  creatingVisit: boolean
  error: string | null
}

// Interfaces para respuestas de API
export interface ICallCenterAPIResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Interfaces para estadísticas
export interface ICallCenterStats {
  totalReports: number
  reportsWithVisits: number // Mantener "With" aquí para claridad semántica
  reportsByManagement: Record<string, number>
  reportsByWeek: Record<number, number>
}

// Interfaces para configuración
export interface ICallCenterConfig {
  maxReportsPerPage: number
  defaultYear: number
  availableWeeks: number[]
  availableYears: number[]
}

export interface ICallCenterSummaryReport {
  gerencia: string
  reportes: number
  anio: number
  semana: number
}

// Type guards
export const isCallCenterReport = (obj: any): obj is ICallCenterReport => {
  return obj && typeof obj.prestamoId === 'string' && typeof obj.nombres_cliente === 'string'
}

export const isCallCenterVisit = (obj: any): obj is ICallCenterVisit => {
  return obj && typeof obj.prestamoId === 'string' && obj.log && obj.location
}