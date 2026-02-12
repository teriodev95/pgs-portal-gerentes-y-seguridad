import { createApiClientFromPreset } from '@/shared/services/core'
import type { ILoan, IPaymentCreate  } from '../types'

class LoanAndPaymentService {
  private apiFastApi = createApiClientFromPreset('fastApi')

  async getLoanById(id: string) {
    return this.apiFastApi.get<ILoan>(`/prestamos/${id}`)
  }

  async createPayment(pago: IPaymentCreate) {
    return this.apiFastApi.post(`/pagos/`, pago)
  }
}

export const loanAndPaymentService = new LoanAndPaymentService()