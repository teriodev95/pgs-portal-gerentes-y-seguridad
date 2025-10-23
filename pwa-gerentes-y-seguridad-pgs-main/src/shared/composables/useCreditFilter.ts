import { type Ref } from 'vue'
import type { AvailableCreditOptions } from '@/interfaces'

/**
 * Interfaz para los filtros de crédito
 */
export interface CreditFilters {
  plazo?: string
  nivel?: string
  monto?: number
}

/**
 * Composable para filtrar opciones de crédito basado en CSV data
 * @param csvData Referencia reactiva a los datos CSV
 * @returns Objeto con métodos y computed properties para filtrar créditos
 */
export function useCreditFilter(csvData: Ref<AvailableCreditOptions[]>) {
  
  /**
   * Filtra los montos disponibles basado en plazo y nivel
   * @param filters Filtros a aplicar (plazo, nivel)
   * @returns Array de montos disponibles
   */
  const getAvailableAmounts = (filters: CreditFilters) => {
    return csvData.value
      .filter(creditItem => {
        const matchesTerm = filters.plazo
          ? creditItem.plazoSemanas === filters.plazo
          : true

        const matchesLevel = filters.nivel
          ? creditItem.nivel === filters.nivel
          : true

        return matchesTerm && matchesLevel
      })
      .map(credit => credit.montoSolicitado)
  }

  /**
   * Filtra las opciones de crédito completas basado en todos los filtros
   * @param filters Filtros completos (plazo, nivel, monto)
   * @returns Array de opciones de crédito filtradas
   */
  const getFilteredCreditOptions = (filters: CreditFilters) => {
    if (!filters.monto || !filters.plazo || !filters.nivel) {
      return []
    }

    return csvData.value.filter(creditItem => {
      const itemAmount = Number(creditItem.montoSolicitado)
      const selectedAmount = Number(filters.monto)

      if (isNaN(itemAmount) || isNaN(selectedAmount)) {
        console.error('Error: Credit amount values are not valid numbers')
        return false
      }

      const matchesAmount = itemAmount === selectedAmount
      const matchesTerm = creditItem.plazoSemanas === filters.plazo
      const matchesLevel = creditItem.nivel === filters.nivel

      return matchesAmount && matchesTerm && matchesLevel
    })
  }

  /**
   * Obtiene el primer pago basado en las opciones filtradas
   * @param filters Filtros completos
   * @returns Valor del primer pago o 0 si no hay opciones
   */
  const getFirstPayment = (filters: CreditFilters): number => {
    const filteredOptions = getFilteredCreditOptions(filters)
    return filteredOptions.length > 0 ? Number(filteredOptions[0].primerPago) : 0
  }

  /**
   * Verifica si la selección de monto está deshabilitada
   * @param filters Filtros actuales
   * @returns true si no hay montos disponibles
   */
  const isAmountSelectDisabled = (filters: CreditFilters): boolean => {
    const availableAmounts = getAvailableAmounts(filters)
    return availableAmounts.length === 0
  }

  /**
   * Obtiene opciones únicas de plazo disponibles
   * @returns Array de plazos únicos
   */
  const getAvailableTerms = () => {
    const terms = csvData.value.map(credit => credit.plazoSemanas)
    return [...new Set(terms)].sort((a, b) => Number(a) - Number(b))
  }

  /**
   * Obtiene opciones únicas de nivel disponibles
   * @returns Array de niveles únicos
   */
  const getAvailableLevels = () => {
    const levels = csvData.value.map(credit => credit.nivel)
    return [...new Set(levels)]
  }

  return {
    // Métodos de filtrado
    getAvailableAmounts,
    getFilteredCreditOptions,
    getFirstPayment,
    isAmountSelectDisabled,
    getAvailableTerms,
    getAvailableLevels
  }
} 