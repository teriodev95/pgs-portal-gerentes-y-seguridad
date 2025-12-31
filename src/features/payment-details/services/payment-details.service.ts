import { createApiClientFromPreset } from '@/shared/services/core'
import type {AgenciaPagosHistorial, ILoanPayments, ILoan } from '../types'
import type { GetBaseProps } from '@/interfaces'

class PaymentDetailsService {
  private apiClient = createApiClientFromPreset('main')
  private faxClient = createApiClientFromPreset('fastApi')

  async getPagosByDate({ agency, week, year }: GetBaseProps) {
    return this.apiClient.get<AgenciaPagosHistorial[]>(`/pays/${agency}/${year}/${week}`)
  }

  async getLoanData (id: string) {
    return this.faxClient.get<ILoan>(`/prestamos/datos/${id}`)
  }

  async getLoanPayments(id: string) {
    return this.faxClient.get<ILoanPayments>(`/pagos/historial/${id}`)
  }
}

export const paymentDetailsService = new PaymentDetailsService()