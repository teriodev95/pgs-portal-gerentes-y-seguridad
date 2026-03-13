import { createApiClientFromPreset } from '@/shared/services/core'
import type { INoPago } from '../types'
import type { GetBaseProps } from '@/interfaces'

class NoPaymentService {
  private faxClient = createApiClientFromPreset('fastApi')

  async getNoPagos({ agency, year, week }: GetBaseProps) {
    return this.faxClient.get<INoPago[]>(`/pagos/no-pagos-visitas?semana=${week}&anio=${year}&agente=${agency}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar registros de no pago',
          message: 'No se pudieron cargar los registros de no pago y visitas. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const noPaymentService = new NoPaymentService()