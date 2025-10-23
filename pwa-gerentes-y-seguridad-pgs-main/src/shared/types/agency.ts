export interface IAgencyDashboard {
  gerencia: string
  agencia: string
  anio: number
  semana: number
  clientes: number
  clientesCobrados: number
  noPagos: number
  numeroLiquidaciones: number
  pagosReducidos: number
  debitoMiercoles: number
  debitoJueves: number
  debitoViernes: number
  debitoTotal: number
  rendimiento: number
  totalDeDescuento: number
  totalCobranzaPura: number
  montoExcedente: number
  multas?: number
  liquidaciones: number
  cobranzaTotal: number
  montoDeDebitoFaltante: number
  efectivoEnCampo: number
  statusAgencia: string,
}