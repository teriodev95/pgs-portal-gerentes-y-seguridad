export type TipoMovimiento = 'INGRESO' | 'EGRESO' | 'EN_CAMPO'

export interface Movimiento {
  gerencia: string
  semana: number
  anio: number
  tipo_mov: TipoMovimiento
  concepto: string
  monto: number
  tabla: string
  registro_id: string
}

export interface ResumenCashFlow {
  total_ingresos: number
  total_egresos: number
  total_en_campo: number
  balance: number
}

export interface CashFlowResponse {
  success: boolean
  data: {
    movimientos: Movimiento[]
    resumen: ResumenCashFlow
  }
}