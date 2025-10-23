export interface SaleFormData {
  fecha: string // formato YYYY-MM-DD
  agencia: string
  nombreCliente: string
  tipo: 'Nuevo' | 'Renovación'
  nivel: 'DIAMANTE' | 'NUEVO' | 'PREMIUM' | 'LEAL' | 'NOBEL' | 'VIP'
  plazo: string
  monto: number
  primerPago: number
}

export interface SaleDetails extends SaleFormData {
  anio: number
  gerencia: string
  id?: number
  semana: number
}