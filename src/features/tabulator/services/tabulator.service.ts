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
          }
        }
      }
    )
  }

  async getMoneyTabulation({ managment, year, week }: GetBaseProps) {
    return this.faxClient.get<MoneyTabulation | { result: string }>(
      `/tabulaciones/?gerencia=${managment}&anio=${year}&semana=${week}`
    )
  }
}

export const tabulationService = new TabulationService()