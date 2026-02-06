export interface ExpenseFormData {
  concepto: string
  litros: number
  monto: number
  urlRecibo: string
  reembolsado: boolean
  tipoGasto: 'CASETAS' | 'GASOLINA' | 'MANTENIMIENTO_VEHICULAR' | 'OTROS' | 'CELULAR'
}

export interface WeeklyExpense extends ExpenseFormData {
  gastoId?: number
  creadoPorId: number
  fecha: string
  semana: number
  anio: number
  gerencia: string
}