import type { Movimiento } from '../types/cashFlow.types'

export function useCashFlowFormatters() {
  function formatMoney(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  function formatMovementsList(movements: Movimiento[]): string {
    return `${movements.length} ${movements.length === 1 ? 'movimiento' : 'movimientos'}`
  }

  return {
    formatMoney,
    formatMovementsList,
  }
}
