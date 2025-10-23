import { createApiClientFromPreset } from '@/shared/services/core'
import type { INoPago } from '../types'
import type { GetBaseProps } from '@/interfaces'

class NoPaymentService {
  private apiClient = createApiClientFromPreset('main')

  async getNoPagos({ user, year, week }: GetBaseProps) {
    return this.apiClient.get<INoPago[]>(`/pays/noPagosWithVisitas/${user}/${year}/${week}`)
  }
}

export const noPaymentService = new NoPaymentService()