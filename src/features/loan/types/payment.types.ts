

export enum PaymentSource {
  CLIENT = "cliente",
  GUARANTOR = "aval",
  REFERENCE = "referencia"
}

export enum RecoverySource {
  AGENT = "agente",
  MANAGER = "gerente",
  SECURITY = "seguridad"
}
export interface IPaymentCreate {
  agente: string
  anio: number
  cliente: string
  comentario: string
  creadoDesde: string
  fechaPago: string
  identificador: string
  isOnline: boolean
  lat: number
  lng: number
  log: string
  monto: number
  pagoId: string
  prestamo: string
  prestamoId: string
  quienPago: string
  recuperadoPor: string
  semana: number
  tarifa: number
  tipo?: string
}

