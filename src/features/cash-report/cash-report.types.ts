import type { ReportDay } from './cash-report.constants'

export interface ApiEnvelope<T> {
  success: boolean
  data: T
}

export interface CashResponsible {
  usuarioId: number | null
  nombre: string | null
  telefono: string | null
}

export interface AgencyCash {
  agencia: string
  agente: string | null
  estado: string | null
  cerrada: boolean
  efectivoEnCampo: number
}

export interface ManagementCash {
  gerencia: string
  gerente: string | null
  responsable: CashResponsible
  efectivo: {
    balanceGerente: number
    custodiaPendiente: number
    conGerente: number
    conAgentes: number
    total: number
  }
  agencias: AgencyCash[]
}

export interface CurrentCashReport {
  sucursal: string
  periodo: { anio: number; semana: number }
  timezone: 'America/Mexico_City'
  modo: 'tiempo_real'
  actualizadoEn: string
  gerencias: ManagementCash[]
  totales: {
    balanceGerente: number
    custodiaPendiente: number
    conGerente: number
    conAgentes: number
    granTotal: number
  }
}

export interface HourlyAgencyCash {
  agencia: string
  estado: string | null
  cerrada: boolean
  efectivoEnCampo: number
}

export interface HourlyManagementCash {
  gerencia: string
  gerente: string | null
  responsable: CashResponsible
  efectivo: {
    conGerente: number
    conAgentes: number
    total: number
  }
  agencias: HourlyAgencyCash[]
}

export interface HourlyCashPoint {
  hora: number
  capturadoEn: string | null
  comparacion: {
    horaAnterior: number | null
    cambioDesdeAnterior: number | null
  }
  totales: {
    conGerente: number
    conAgentes: number
    granTotal: number
  }
  gerencias: HourlyManagementCash[]
}

export interface HourlyCashReport {
  sucursal: string
  fechaMx: string
  timezone: 'America/Mexico_City'
  modo: 'snapshots_horarios'
  resumen: {
    horasDisponibles: number
    primeraHora: number | null
    ultimaHora: number | null
    pico: { hora: number; granTotal: number } | null
  }
  horas: HourlyCashPoint[]
}

export interface HistoricalAgencyCash {
  agencia: string
  estado: string | null
  cerrada: boolean | null
  cobranzaTotal: number | null
  entregado: {
    gerente: number | null
    auditor: number | null
    regional: number | null
    total: number | null
  }
  efectivoEnCampo: number | null
}

export interface HistoricalManagementCash {
  gerencia: string
  gerente: string | null
  efectivo: {
    conGerente: number | null
    conAgentes: number | null
    total: number | null
  } | null
  agencias: HistoricalAgencyCash[]
  conciliacionAgencias: {
    sumaAgencias: number | null
    diferencia: number | null
    consistente: boolean | null
  } | null
}

export interface HistoricalCashWeek {
  periodo: { anio: number; semana: number }
  disponible: boolean
  completo: boolean
  corte: {
    fechaMx: string
    diaRegistro: string
    horaReal: number
    reportaEn: string
    capturadoEn: string | null
  } | null
  gerencias: HistoricalManagementCash[]
  totales: {
    conGerente: number
    conAgentes: number
    granTotal: number
  } | null
}

export interface HistoricalCashReport {
  sucursal: string
  reporteDelDia: ReportDay
  timezone: 'America/Mexico_City'
  modo: 'snapshots'
  fuente: string
  generadoEn: string
  semanas: HistoricalCashWeek[]
}

export interface CashContactContext {
  gerencia: string
  responsable: CashResponsible
  concepto: string
  monto: number
}
