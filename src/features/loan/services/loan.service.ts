import { createApiClientFromPreset } from '@/shared/services/core'
import type { ILoan, IPaymentCreate  } from '../types'
import { formatToHumanDate, toCurrency } from '@/shared/utils'

class LoanAndPaymentService {
  private apiFastApi = createApiClientFromPreset('fastApi')

  async getLoanById(id: string) {
    return this.apiFastApi.get<ILoan>(`/prestamos/${id}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar préstamo',
          message: 'No se pudo cargar la información del préstamo. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async createPayment(pago: IPaymentCreate) {
    const transactionDetails = [
      `- Fecha de aplicación del pago: <span class='font-extrabold'>${formatToHumanDate(new Date(), true)}</span>`,
      `- Monto abonado: <span class='font-extrabold'>${toCurrency(pago.monto)}</span>`
    ]

    return this.apiFastApi.post(`/pagos/`, pago, {
      meta: {
        successNotification: {
          mainText: '¡Pago registrado con éxito!',
          secondaryText: `Se ha registrado correctamente el pago de <span class='font-extrabold'>${pago.cliente}</span>`,
          subText: 'A continuación, los detalles de la transacción:',
          list: transactionDetails
        },
        errorNotification: {
          title: 'Error al registrar pago',
          message: 'No se pudo registrar el pago. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const loanAndPaymentService = new LoanAndPaymentService()