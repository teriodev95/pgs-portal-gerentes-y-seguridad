//export * from './assignment.interface'
//export * from './cash-flow.interface'

export * from './agency.interface'
export * from './cobranza.interface'
export * from './comisiones.interface'
export * from './common.interface'
export * from './management.interface'
export * from './weekly-details.interface'
export * from './new-cash-flow.interface'
export * from './new-weekly-details.interface'

export interface AvailableCreditOptions {
  desconocida: string
  montoSolicitado: string
  cargo: string
  totalPagar: string
  tarifaSemanal: string
  primerPago: string
  nivel: string
  plazoSemanas: string
  identificador: string
}