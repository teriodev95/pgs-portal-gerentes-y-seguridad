export type SaleOrigin = 'agente' | 'gerente'

/** Seguridad o Regional ligado a la gerencia: quien entrega en una agencia vacante. */
export interface SecurityStaff {
  usuarioId: number
  nombreCompleto: string
  tipo: 'Seguridad' | 'Regional'
}

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
  /** Quien de Seguridad/Regional estuvo en la entrega. Solo agencia vacante; '' = no aplica o sin elegir. */
  seguridadEnVenta: string
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