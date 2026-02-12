import { createApiClientFromPreset } from '@/shared/services/core'
import type { IFullPayment, ILoanPayments, ILoan } from '../types'
import type { GetBaseProps } from '@/interfaces'

class PaymentDetailsService {
  private faxClient = createApiClientFromPreset('fastApi')

  async getPagosByDate({ agency, week, year }: GetBaseProps) {
    return this.faxClient.get<IFullPayment[]>(`/pagos/?semana=${week}&anio=${year}&agente=${agency}`)
  }

  async getLoanData (id: string) {
    return this.faxClient.get<ILoan>(`/prestamos/datos/${id}`)
  }

  async getLoanPayments(id: string) {
    return this.faxClient.get<ILoanPayments>(`/pagos/historial/${id}`)
  }
}

export const paymentDetailsService = new PaymentDetailsService()