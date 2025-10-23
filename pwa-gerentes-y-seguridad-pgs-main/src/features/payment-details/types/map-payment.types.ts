export interface AgenciaPagosHistorial {
  pagoId: string
  prestamoId: string
  prestamo: string
  monto: number
  semana: number
  anio: number
  esPrimerPago: boolean
  abreCon: number
  cierraCon: number
  tarifa: number
  cliente: string
  agente: string
  tipo: string
  creadoDesde: string
  identificador: string
  fechaPago: string
  lat: number
  lng: number
  comentario: string
  datosMigracion: string
  createdAt: string
  updatedAt: string
  log?: string
  quienPago?: string
}