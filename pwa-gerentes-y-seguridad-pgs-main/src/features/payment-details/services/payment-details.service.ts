import { createApiClientFromPreset } from '@/shared/services/core'
import type {AgenciaPagosHistorial, IPaymentSummary } from '../types'
import type { GetBaseProps } from '@/interfaces'

class PaymentDetailsService {
  private apiClient = createApiClientFromPreset('main')

  async getLoanHistoryById(id: string) {
    return this.apiClient.get<{ historico: IPaymentSummary[] }>(`/pwa/historico/${id}`)
  }

  async getPagosByDate({ agency, week, year }: GetBaseProps) {
    return this.apiClient.get<AgenciaPagosHistorial[]>(`/pays/${agency}/${year}/${week}`)
  }
}

export const paymentDetailsService = new PaymentDetailsService()