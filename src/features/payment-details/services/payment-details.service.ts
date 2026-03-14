import { createApiClientFromPreset } from '@/shared/services/core'
import type { IFullPayment, ILoanPayments, ILoan } from '../types'
import type { GetBaseProps } from '@/interfaces'

class PaymentDetailsService {
  private faxClient = createApiClientFromPreset('fastApi')

  async getPagosByDate({ agency, week, year }: GetBaseProps) {
    return this.faxClient.get<IFullPayment[]>(`/pagos/?semana=${week}&anio=${year}&agente=${agency}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar pagos',
          message: 'No se pudieron cargar los pagos. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getLoanData (id: string) {
    return this.faxClient.get<ILoan>(`/prestamos/datos/${id}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar datos del préstamo',
          message: 'No se pudieron cargar los datos del préstamo. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getLoanPayments(id: string) {
    return this.faxClient.get<ILoanPayments>(`/pagos/historial/${id}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar historial de pagos',
          message: 'No se pudo cargar el historial de pagos del préstamo. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const paymentDetailsService = new PaymentDetailsService()