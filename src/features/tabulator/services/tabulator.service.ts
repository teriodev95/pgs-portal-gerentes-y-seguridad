// ✅ Migrated to new service architecture
import { createApiClientFromPreset } from '@/shared/services/core'
import type { GetBaseProps } from '@/interfaces'
import type { MoneyTabulation, TabulationFormData } from "../types"

class TabulationService {
  private faxClient = createApiClientFromPreset('fastApi')

  async createMoneyTabulation(tabulation: MoneyTabulation) {
    return this.faxClient.post(`/tabulaciones/`, tabulation, {
      meta: {
        successNotification: {
          mainText: '¡Tabulación creada!',
          secondaryText: 'La tabulación de dinero se ha registrado exitosamente'
        },
        errorNotification: {
          title: 'Error al crear tabulación',
          message: 'No se pudo crear la tabulación de dinero. Por favor, verifica los datos e intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async updateMoneyTabulation(
    tabulation: TabulationFormData, id: number
  ) {
    return this.faxClient.patch(
      `/tabulaciones/${id}`,
      tabulation,
      {
        meta: {
          successNotification: {
            mainText: '¡Tabulación actualizada!',
            secondaryText: 'Los cambios se han guardado correctamente'
          },
          errorNotification: {
            title: 'Error al actualizar tabulación',
            message: 'No se pudieron guardar los cambios en la tabulación. Por favor, intenta nuevamente.',
            type: 'error'
          }
        }
      }
    )
  }

  async getMoneyTabulation({ managment, year, week }: GetBaseProps) {
    return this.faxClient.get<MoneyTabulation | { result: string }>(
      `/tabulaciones/?gerencia=${managment}&anio=${year}&semana=${week}`,
      {
        meta: {
          errorNotification: {
            title: 'Error al cargar tabulación',
            message: 'No se pudo cargar la tabulación de dinero. Por favor, intenta nuevamente.',
            type: 'error'
          }
        }
      }
    )
  }
}

export const tabulationService = new TabulationService()