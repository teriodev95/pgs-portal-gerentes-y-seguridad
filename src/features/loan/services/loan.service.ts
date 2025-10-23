import { createApiClientFromPreset } from '@/shared/services/core'
import type { ILoan, IPaymentCreate  } from '../types'

class LoanAndPaymentService {
  private apiClient = createApiClientFromPreset('main')

  async getLoanById(id: string) {
    return this.apiClient.get<ILoan>(`/loans/${id}`)
  }

  async createPayment(pago: IPaymentCreate) {
    return this.apiClient.post(`/pays/create-one`, pago)
  }
}

export const loanAndPaymentService = new LoanAndPaymentService()