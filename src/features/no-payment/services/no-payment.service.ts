import { createApiClientFromPreset } from '@/shared/services/core'
import type { INoPago } from '../types'
import type { GetBaseProps } from '@/interfaces'

class NoPaymentService {
  private faxClient = createApiClientFromPreset('fastApi')

  async getNoPagos({ agency, year, week }: GetBaseProps) {
    return this.faxClient.get<INoPago[]>(`/pagos/no-pagos-visitas?semana=${week}&anio=${year}&agente=${agency}`)
  }
}

export const noPaymentService = new NoPaymentService()