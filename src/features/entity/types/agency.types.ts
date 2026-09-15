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

/** GET /pwa/salidas/:agencia (Elysia). Solo semana en curso. Spec: gitea xpress-pgs #11. */
export type TipoSalida = 'TERMINO' | 'CON_DESCUENTO' | 'ESPECIAL'

export interface ISalidaSemana {
  prestamoId: string
  nombre: string
  tipo: TipoSalida
  saldoInicioSemana: number
  cerroCon: number
  descuento: number
  recuperacion: 'RECUPERADO' | 'PENDIENTE' | null
  quienPago: string | null
  fecha: string | null
}

export interface IPorTerminar {
  prestamoId: string
  nombre: string
  tarifa: number
  saldoInicioSemana: number
  falta: number
}

export interface ISalidasSemana {
  semana: { anio: number; semana: number }
  resumen: { terminaron: number; conDescuento: number; especiales: number; porTerminar: number }
  salidas: ISalidaSemana[]
  porTerminar: IPorTerminar[]
}