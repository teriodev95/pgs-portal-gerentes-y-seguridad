export interface INoPago {
  prestamoId: string
  tarifa: number
  agente: string
  creadoDesde: string
  lng: number
  semana: number
  gerencia: string
  fechaPago: string
  visitas: IVisita[]
  cliente: string
  pagoId: string
  monto: number
  anio: number
  lat: number
}

export interface IVisita {
  prestamoId: string
  cliente: string
  agente: string
  fecha: string
  lng: number
  visitaId: string
  semana: number
  anio: number
  lat: number
}