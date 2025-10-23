import type { ILoan } from "@/features/loan/types"

export interface IAgencyFinancialSummary {
  gerencia: string
  agencia: string
  anio: number
  semana: number
  clientes: number
  clientesCobrados: number
  noPagos: number
  numeroLiquidaciones: number
  pagosReducidos: number
  debitoTotal: number
  rendimiento: number
  totalDeDescuento: number
  totalCobranzaPura: number
  montoExcedente: number
  multas: number
  liquidaciones: number
  cobranzaTotal: number
  montoDeDebitoFaltante: number
}

export interface ILoansAboutToEnd {
  porFinalizar: number
  prestamos: ILoan[]
}