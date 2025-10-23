export interface CorrectionRequest {
  agencia: string
  gerencia: string
  anio: number
  semana: number
  tipo: CorrectionType
  operacion: 'editar' | 'eliminar' // Union type for specific allowed values
  datosAactualizar: {
    id: number | string
    monto?: number // Required for 'editar' operation
    comisionCobranzaPagadaEnSemana?: number // Optional for 'eliminar' operation
    bonosPagadosEnSemana?: number // Optional for 'eliminar' operation
    comisionVentasPagadaEnSemana?: number // Optional for 'eliminar' operation
  }
  creadoPor: string
}

export interface CorrectionFormData {
  type: CorrectionType
  recordId: string | number
  newAmount?: number
  newCollectionCommissionPaidInWeek?: number
  newSalesCommissionPaidInWeek?: number
  newBonusesPaidInWeek?: number
  action: 'correct' | 'delete' | ''
}

export type CorrectionType = 'pago' | 'asignacion' | 'venta' | 'gasto' | 'cierre' | ''