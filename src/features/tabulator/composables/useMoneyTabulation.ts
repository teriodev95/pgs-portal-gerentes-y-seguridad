import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/shared/stores'
import { useToast } from 'vue-toast-notification'
import type { MoneyTabulation, TabulationFormData } from '../types'
import { tabulationService } from '../services/tabulator.service'
import { useTabulationErrorHandler } from './useTabulationErrorHandler'

export function useMoneyTabulation() {
  // Services, Composables and Stores initialization
  const $store = useStore()
  const $toast = useToast()
  const { handleError } = useTabulationErrorHandler()

  // State definitions
  const currentTabulationData = ref<MoneyTabulation>()
  const hasTabulationForCurrentWeek = ref(false)
  const isLoadingTabulation = ref(false)
  const isSavingTabulation = ref(false)

  // Computed properties
  const currentDate = computed(() => $store.currentDate)
  const gerenciaSelected = computed(() => $store.gerenciaSelected)

  const isFormValid = computed(() => true) // Validation will be done in the component

  const canEdit = computed(() => !hasTabulationForCurrentWeek.value)

  // Helper functions
  /**
   * Validates if a tabulation object represents an empty/new tabulation.
   * A tabulation is considered empty when all denomination quantities are 0.
   * This helps distinguish between a real existing tabulation and a placeholder
   * returned by the API when no tabulation exists for the current week.
   *
   * @param tabulation - The tabulation object to validate
   * @returns true if all denomination quantities are 0, false otherwise
   */
  function isTabulationEmpty(tabulation: MoneyTabulation): boolean {
    const denominationValues = [
      tabulation.cantidad50Centavos,
      tabulation.cantidad1Peso,
      tabulation.cantidad2Pesos,
      tabulation.cantidad5Pesos,
      tabulation.cantidad10Pesos,
      tabulation.cantidad20Pesos,
      tabulation.cantidad20Billetes,
      tabulation.cantidad50Billetes,
      tabulation.cantidad100Billetes,
      tabulation.cantidad200Billetes,
      tabulation.cantidad500Billetes,
      tabulation.cantidad1000Billetes
    ]

    return denominationValues.every(value => value === 0)
  }

  // Methods
  async function fetchTabulationData(): Promise<void> {
    if (!gerenciaSelected.value) {
      handleError(new Error('Gerencia no seleccionada'), 'VALIDATION_FAILED')
      return
    }

    try {
      isLoadingTabulation.value = true

      const { data } = await tabulationService.getMoneyTabulation({
        week: currentDate.value.week,
        year: currentDate.value.year,
        managment: gerenciaSelected.value
      })

      console.log('Tabulation data fetched:', data)

      // Type guard to check if result is an error message
      const isErrorResult = (data: MoneyTabulation | { result: string }): data is { result: string } => {
        return 'result' in data
      }

      if (!isErrorResult(data)) {
        // Check if the tabulation is empty (all values are 0)
        // If empty, treat it as if no tabulation exists
        const isEmpty = isTabulationEmpty(data)

        if (isEmpty) {
          console.log('Tabulation exists but is empty (all zeros) - treating as new tabulation')
          hasTabulationForCurrentWeek.value = false
          currentTabulationData.value = undefined
        } else {
          console.log('Tabulation exists with valid data')
          currentTabulationData.value = data
          hasTabulationForCurrentWeek.value = true
        }
      } else {
        console.log('No tabulation found for current week')
        hasTabulationForCurrentWeek.value = false
        currentTabulationData.value = undefined
      }
    } catch (error) {
      //handleError(error, 'TABULATION_LOAD_FAILED')
      //throw error
    } finally {
      isLoadingTabulation.value = false
    }
  }

  async function saveTabulationData(formData: TabulationFormData, isUpdate: boolean): Promise<void> {
    console.log('saveTabulationData called with:', formData, 'isUpdate:', isUpdate)

    if (!gerenciaSelected.value) {
      handleError(new Error('Gerencia no seleccionada'), 'VALIDATION_FAILED')
      return Promise.reject(new Error('Gerencia no seleccionada'))
    }

    try {
      isSavingTabulation.value = true

      if (isUpdate && currentTabulationData.value) {
        // Update existing tabulation
        await tabulationService.updateMoneyTabulation(
          formData,
          currentTabulationData.value.id!
        )
        $toast.success('Tabulación actualizada con éxito')
      } else {
        // Create new tabulation
        const tabulationData: MoneyTabulation = {
          ...formData,
          gerencia: gerenciaSelected.value,
          anio: currentDate.value.year,
          semana: currentDate.value.week
        }
        console.log('Saving tabulation data:', tabulationData)
        await tabulationService.createMoneyTabulation(tabulationData)
        $toast.success('Tabulación guardada con éxito')
      }

      // Refresh tabulation data after save/update
      await fetchTabulationData()
      return Promise.resolve()
    } catch (error) {
      const errorType = hasTabulationForCurrentWeek.value ? 'TABULATION_UPDATE_FAILED' : 'TABULATION_SAVE_FAILED'
      handleError(error, errorType)
      return Promise.reject(error)
    } finally {
      isSavingTabulation.value = false
    }
  }

  // Clear tabulation will be handled by the component

  // Lifecycle hooks
  onMounted(async () => {
    try {
      await fetchTabulationData()
    } catch (error) {
      // Error already handled in fetchTabulationData
    }
  })

  return {
    // State
    currentTabulationData,
    hasTabulationForCurrentWeek,
    isLoadingTabulation,
    isSavingTabulation,

    // Computed - Basic
    currentDate,
    gerenciaSelected,

    // Computed - Specific  
    isFormValid,
    canEdit,

    // Methods
    fetchTabulationData,
    saveTabulationData
  }
}