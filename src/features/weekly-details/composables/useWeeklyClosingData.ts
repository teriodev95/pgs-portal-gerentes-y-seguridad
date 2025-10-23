import { ref } from 'vue'
import type {
  GetBaseProps,
  IGeneralBalance,
  IManagementNumbers,
  IWeeklyDetails
} from '@/interfaces'

import type { MoneyTabulation } from '@/features/tabulator/types'
import { useStore } from '@/shared/stores'
import { tabulationService } from '@/features/tabulator/services/tabulator.service'
import { weeklyDetailsService } from '../services/weekly-details.service'

export const useWeeklyClosingData = () => {
  const weeklyClosingDetails = ref<IWeeklyDetails>()
  const generalBalance = ref<IGeneralBalance>()
  const tabulation = ref<MoneyTabulation>()
  const managementNumbers = ref<IManagementNumbers>()
  const isLoading = ref(false)
  const $store = useStore()

  const fetchWeeklyClosingDetails = async () => {
    try {
      isLoading.value = true
      const response = await weeklyDetailsService.getWeeklyDetails(
        $store.gerenciaSelected as string,
        $store.currentDate.week,
        $store.currentDate.year
      )
      weeklyClosingDetails.value = response.data
    } catch (error) {
      console.error('Error fetching weekly closing details:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchPdfData = async ({ managment, year, week }: GetBaseProps): Promise<void> => {
    try {
      if (!managment || !year || !week) {
        throw new Error('Faltan parámetros requeridos para obtener datos para el PDF')
      }

      const [generalBalanceResponse, managementNumbersResponse, tabulationResponse] =
        await Promise.all([
          weeklyDetailsService.getGeneralBalance(managment),
          weeklyDetailsService.getManagementNumbers(managment),
          tabulationService.getMoneyTabulation({
            managment,
            year,
            week
          })
        ])

      generalBalance.value = generalBalanceResponse.data
      managementNumbers.value = managementNumbersResponse.data
      tabulation.value = !isResultString(tabulationResponse.data)
        ? tabulationResponse.data
        : undefined
    } catch (error) {
      console.error('Error al obtener datos para el PDF:', error)

      // Rethrow con información más específica para facilitar el debugging
      if (error instanceof Error) {
        throw new Error(`Error en fetchPdfData: ${error.message}`)
      } else {
        throw new Error('Error desconocido al obtener datos para el PDF')
      }
    }
  }

  const isResultString = (
    data: MoneyTabulation | { result: string }
  ): data is { result: string } => {
    return 'result' in data
  }

  return {
    generalBalance,
    isLoading,
    managementNumbers,
    tabulation,
    weeklyClosingDetails,

    fetchPdfData,
    fetchWeeklyClosingDetails
  }
}
