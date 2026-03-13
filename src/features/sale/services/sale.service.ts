import { createApiClientFromPreset } from '@/shared/services/core'
import type { SaleDetails } from "../types"

class SalesService {
  private faxClient = createApiClientFromPreset('fastApi')

  async createSale(sale: SaleDetails) {
    return this.faxClient.post(`/ventas/`, sale, {
      meta: {
        successNotification: {
          mainText: '¡Venta registrada!',
          secondaryText: 'La venta se ha creado exitosamente'
        },
        errorNotification: {
          title: 'Error al registrar venta',
          message: 'No se pudo registrar la venta. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getSales(managment: string, year: number, week: number) {
    return this.faxClient.get<SaleDetails[]>(`/ventas/?gerencia=${managment}&anio=${year}&semana=${week}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar ventas',
          message: 'No se pudieron cargar las ventas. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const salesService = new SalesService()
