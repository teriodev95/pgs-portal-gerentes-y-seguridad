export const LOAN_MODAL_MESSAGES = {
  WEEKLY_FEE_NOT_PAID: {
    title: 'No puedes liquidar aún',
    message: 'Para liquidar este préstamo, primero debes cubrir la tarifa semanal {tarifa}. Actualmente el prestamo tiene cubierto {weeklyPayment}'
  },
  SETTLEMENT_OPTIONS: {
    title: 'Elige tu opción de liquidación',
    message: 'Antes de continuar, selecciona cómo deseas liquidar el préstamo.'
  },
  SETTLEMENT_WITHOUT_DISCOUNT: {
    title: 'Pago Completo del Préstamo',
    message: 'Para saldar el préstamo sin descuento, entra al módulo de registro de pagos, selecciona el cliente y registra el monto total del saldo.'
  },
  SETTLEMENT_NOT_AVAILABLE: {
    title: 'Liquidación no disponible',
    message: 'El préstamo ya no aplica para liquidación con descuento por las semanas transcurridas. Para cubrir todo el saldo del préstamo, ingresa el monto del saldo en el módulo de pagos.'
  }
} as const

export const LOAN_BUTTON_LABELS = {
  UNDERSTOOD: 'Entendido',
  SETTLEMENT_WITH_DISCOUNT: 'Liquidación con descuento',
  SETTLEMENT_WITHOUT_DISCOUNT: 'Saldar sin descuento',
  HISTORY: 'Historial',
  LIQUIDATE: 'Liquidar'
} as const

export type LoanModalMessageType = keyof typeof LOAN_MODAL_MESSAGES