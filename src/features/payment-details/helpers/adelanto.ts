import type { IPayment } from '../types'

// Tipos que no representan dinero de tarifa (no suman al total semanal)
export const TIPOS_NO_MONETARIOS = ['Visita', 'Multa', 'No_pago', 'Adelantado']

// El remanente de un adelanto viaja en el comentario del marcador con el
// formato de contrato [remanente=NNN.NN] — el mismo que parsean los triggers
// y vistas de BD. No es texto de display: es una API establecida.
export interface RemanenteAdelanto {
  remanente: number
  aCobrar: number
}

export function parseRemanenteAdelanto(payment: IPayment | null | undefined): RemanenteAdelanto | null {
  if (!payment || payment.tipo !== 'Adelantado' || !payment.comentario) return null
  const match = payment.comentario.match(/\[remanente=([0-9]+(?:\.[0-9]+)?)\]/)
  if (!match) return null
  const remanente = Number(match[1])
  const tarifa = payment.tarifa
  if (!remanente || !tarifa || remanente >= tarifa) return null
  return { remanente, aCobrar: Math.round((tarifa - remanente) * 100) / 100 }
}
