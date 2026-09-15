export type CobranzaStatus = 'Completado' | 'Parcial' | 'Desfase' | 'Pendiente'

export interface ICobranza {
  nombre: string
  prestamoId: number | string
  tarifa: number
  cobradoEnLaSemana: number
  status: CobranzaStatus
  fechaUltimoPago: string
  totalAPagar: number
  pagado: number
  restante: number
  porcentaje: number
  crtp: number
}
/**
 * Contrato de GET /pwa/cobranza/v2. Separa lo de la semana de lo del préstamo
 * para poder pintar el saldo vivo en el inicio. La v1 (ICobranza) sigue en uso
 * en Pagos y en el layout; volver a ella es cambiar una llamada.
 */
export interface ICobranzaV2 {
  prestamoId: string
  nombre: string
  status: CobranzaStatus
  diaDePago: string
  semana: {
    tarifa: number
    cobrado: number
    /** Pagos registrados en la semana; un no pago de $0 también cuenta. */
    pagos: number
    ultimoPago: string | null
  }
  prestamo: {
    total: number
    pagado: number
    saldo: number
    /** Porcentaje pagado del total, con un decimal. */
    avance: number
    saldoInicioSemana: number
  }
}
