import type { ILoan } from "@/features/loan/types"

export interface IAgencyFinancialSummary {
  agencia: string
  anio: number
  clientes: number
  clientesCobrados: number
  cobranzaTotal: number
  debitoTotal: number
  gerencia: string
  liquidaciones: number
  montoDeDebitoFaltante: number
  montoExcedente: number
  multas: number
  noPagos: number
  numeroLiquidaciones: number
  pagosReducidos: number
  rendimiento: number
  semana: number
  totalCobranzaPura: number
  totalDeDescuento: number
}

export interface ILoansAboutToEnd {
  porFinalizar: number
  prestamos: ILoan[]
}