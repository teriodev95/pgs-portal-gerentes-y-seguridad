export type SaleOrigin = 'agente' | 'gerente'

/** Desembolso (borrador de credito) de la gerencia y semana que todavia no tiene venta. */
export interface Disbursement {
  prestamoId: string
  solicitudId: string | null
  estadoBorrador: string
  nombreCliente: string
  agencia: string
  gerencia: string
  tipo: 'Nuevo' | 'Renovación'
  nivel: string
  plazo: number
  monto: number
  primerPago: number
  semana: number
  anio: number
}

export interface SaleFormData {
  agencia: string 
  fecha: string // formato YYYY-MM-DD
  generadaPor: SaleOrigin | '' // '' = aún sin elegir
  monto: number
  nivel: 'DIAMANTE' | 'NUEVO' | 'PREMIUM' | 'LEAL' | 'NOBEL' | 'VIP'
  nombreCliente: string
  plazo: string
  primerPago: number
  tipo: 'Nuevo' | 'Renovación'
  /** Desembolso del que salio la venta. Vacio = captura manual. */
  prestamoId?: string | null
  /** Solicitud de la app de la que salio la venta. */
  solicitudId?: string | null
}

export interface SaleDetails extends SaleFormData {
  anio: number 
  gerencia: string
  semana: number
  createdAtFormatted?: string
  id?: number
}