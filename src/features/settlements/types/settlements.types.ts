export interface Liquidacion {
  cliente: string
  identificador: string
  semEntrega: string
  entregado: number
  cargo: number
  montoTotal: number
  cobrado: number
  saldo: number
  descuentoDinero: number
  descuentoPorcentaje: number
  semanasTranscurridas: number
  liquidaCon: number
  prestamoId: string
  quienPago?: string,
  recuperadoPor?: string,
}