export type CobranzaStatus = 'Completado' | 'Parcial' | 'Desfase' | 'Pendiente'

export interface ICobranza {
  nombre: string
  prestamoId: number | string
  tarifa: number
  cobradoEnLaSemana: number
  status: CobranzaStatus
  fechaUltimoPago: string
  totalAPagar: number
  pagado: number
  restante: number
  porcentaje: number
  crtp: number
}