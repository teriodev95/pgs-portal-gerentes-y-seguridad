export interface SaleFormData {
  agencia: string 
  fecha: string // formato YYYY-MM-DD
  monto: number
  nivel: 'DIAMANTE' | 'NUEVO' | 'PREMIUM' | 'LEAL' | 'NOBEL' | 'VIP'
  nombreCliente: string
  plazo: string
  primerPago: number
  tipo: 'Nuevo' | 'Renovación'
}

export interface SaleDetails extends SaleFormData {
  anio: number 
  gerencia: string
  id?: number
  semana: number
}