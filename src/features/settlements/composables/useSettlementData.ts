import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Liquidacion } from '../types'
import { settlementsService } from '../services/settlements.service'
import { useNotification } from '@/shared/composables/useNotification'

// Validation function
function validateSettlementData(settlement: Liquidacion): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!settlement.quienPago) {
    errors.push('Debe especificar quién realizó el pago')
  }
  
  if (!settlement.recuperadoPor) {
    errors.push('Debe especificar quién recuperó el pago')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function useSettlementData() {
  // Services and composables
  const $route = useRoute()
  const { showError } = useNotification()

  // State definitions
  const settlementData = ref<Liquidacion>()
  const isLoading = ref(true)
  const isProcessing = ref(false)

  // Computed properties
  const hasSettlementData = computed(() => !!settlementData.value)
  const loanId = computed(() => $route.query.prestamo as string)
  
  const settlementSummary = computed(() => {
    if (!settlementData.value) return null
    
    return {
      client: settlementData.value.cliente,
      identifier: settlementData.value.identificador,
      totalAmount: settlementData.value.montoTotal,
      settlementAmount: settlementData.value.liquidaCon,
      discountPercentage: settlementData.value.descuentoPorcentaje
    }
  })

  const isSettlementValid = computed(() => {
    if (!settlementData.value) return false
    return validateSettlementData(settlementData.value).isValid
  })

  // Methods
  async function fetchSettlementData(loanId: string): Promise<void> {
    if (!loanId) {
      showError('ID de préstamo no proporcionado')
      return
    }

    try {
      isLoading.value = true
      const data = await settlementsService.getLiquidacion(loanId)
      settlementData.value = data
    } catch (error) {
      showError('Error al cargar los datos de la liquidación')
    } finally {
      isLoading.value = false
    }
  }

  function updateSettlementData(updates: Partial<Liquidacion>): void {
    if (!settlementData.value) return
    
    settlementData.value = {
      ...settlementData.value,
      ...updates
    }
  }

  function clearSettlementData(): void {
    settlementData.value = undefined
    isLoading.value = true
    isProcessing.value = false
  }

  // Auto-initialize if loan ID is available
  async function initializeSettlement(): Promise<void> {
    const currentLoanId = loanId.value
    if (currentLoanId) {
      await fetchSettlementData(currentLoanId)
    }
  }

  return {
    // State
    settlementData,
    isLoading,
    isProcessing,
    
    // Computed
    hasSettlementData,
    loanId,
    settlementSummary,
    isSettlementValid,
    
    // Methods
    fetchSettlementData,
    updateSettlementData,
    clearSettlementData,
    initializeSettlement,
    validateSettlementData
  }
}