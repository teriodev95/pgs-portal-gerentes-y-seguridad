export type SaleOrigin = 'agente' | 'gerente'

/** Solicitud con todos los vistos buenos que aun no se registro como venta. */
export interface ApprovedRequest {
  solicitudId: string
  status: string
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
  /** Solicitud de la app de la que salio la venta. Vacio = captura manual. */
  solicitudId?: string | null
  /** Credito ligado cuando oficina ya creo el borrador. */
  prestamoId?: string | null
}

export interface SaleDetails extends SaleFormData {
  anio: number 
  gerencia: string
  semana: number
  createdAtFormatted?: string
  id?: number
}