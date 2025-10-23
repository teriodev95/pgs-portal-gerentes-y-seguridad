export interface IClientVisit {
  visitaId: string
  prestamoId: string
  semana: number
  anio: number
  cliente: string
  agente: string
  fecha: string
  lat: number
  lng: number
}

export interface IPaymentRecord {
  abreCon: number
  agente: string
  anio: number
  cierraCon: number
  cliente: string
  comentario: string
  creadoDesde: string
  createdAt: string
  datosMigracion: string
  esPrimerPago: boolean
  fechaPago: string
  identificador: string
  lat: number
  lng: number
  log?: string
  monto: number
  pagoId: string
  prestamo: number | string
  prestamoId: number | string
  quienPago?: string
  semana: number
  tarifa: number
  tipo: string
  updatedAt: string
}

export interface IPaymentSummary {
  monto: number
  tipo: string
  prestamoId: string
  prestamo: string
  semana: number
  anio: number
  tarifa: number
  cliente: string
  agente: string
  identificador: string
  pagos: IPaymentRecord[]
  visitas: IClientVisit[]
}