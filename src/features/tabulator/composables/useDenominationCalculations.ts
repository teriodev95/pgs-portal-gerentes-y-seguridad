import { ref, computed } from 'vue'
import { DEFAULT_DENOMINATIONS, type Denomination } from '../constants/denominations'
import type { MoneyTabulation, TabulationFormData } from '../types'
import { useNotification } from '@/shared/composables/useNotification'

export function useDenominationCalculations() {
  const { showError } = useNotification()

  // State
  const denominations = ref<Denomination[]>(
    DEFAULT_DENOMINATIONS.map(den => ({ ...den }))
  )

  // Computed properties
  const billDenominations = computed(() =>
    denominations.value.filter(den => den.type === 'bill')
  )

  const coinDenominations = computed(() =>
    denominations.value.filter(den => den.type === 'coin')
  )

  const grandTotal = computed(() =>
    denominations.value.reduce((acc, den) =>
      acc + calculateDenominationTotal(den), 0)
  )

  // Methods
  function calculateDenominationTotal(denomination: Denomination): number {
    return denomination.value * denomination.quantity
  }

  function updateDenominationQuantity(index: number, quantity: number): void {
    if (index < 0 || index >= denominations.value.length) {
      showError('Índice de denominación inválido')
      return
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      showError('Cantidad de denominación inválida')
      return
    }

    denominations.value[index].quantity = quantity
  }

  function clearAllDenominations(): void {
    denominations.value.forEach(den => {
      den.quantity = 0
    })
  }

  function updateFromTabulation(tabulation: MoneyTabulation): void {
    try {
      denominations.value.forEach(den => {
        const value = tabulation[den.formKey]
        den.quantity = Number(value) || 0
      })
    } catch (error) {
      showError('Error al actualizar las denominaciones desde la tabulación. Por favor, verifica los datos ingresados.')
    }
  }

  function generateFormData(): TabulationFormData {
    try {
      return denominations.value.reduce((data, den) => {
        data[den.formKey] = Number(den.quantity) || 0
        return data
      }, {} as TabulationFormData)
    } catch (error) {
      showError('Error al generar los datos del formulario. Por favor, verifica las cantidades ingresadas.')
      throw error
    }
  }

  function validateDenominations(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    denominations.value.forEach((den) => {
      if (den.quantity < 0) {
        errors.push(`La cantidad de ${den.value} no puede ser negativa`)
      }
      
      if (!Number.isInteger(den.quantity)) {
        errors.push(`La cantidad de ${den.value} debe ser un número entero`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  return {
    // State
    denominations,
    
    // Computed
    billDenominations,
    coinDenominations,
    grandTotal,
    
    // Methods
    calculateDenominationTotal,
    updateDenominationQuantity,
    clearAllDenominations,
    updateFromTabulation,
    generateFormData,
    validateDenominations
  }
}