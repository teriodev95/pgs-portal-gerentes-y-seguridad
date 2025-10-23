import { ref } from 'vue'
import type { Liquidacion } from '../types'
import { PaymentSource, RecoverySource } from '@/features/loan/types'
import { settlementsService } from '../services/settlements.service'
import { useSettlementErrorHandler } from './useSettlementErrorHandler'

interface PaymentFormData {
  amount: number
  paymentSource: PaymentSource
  paymentRecovery: RecoverySource
}

export function useSettlementProcessor() {
  // Services and composables
  const { handleError, handleSuccess } = useSettlementErrorHandler()

  // State definitions
  const isProcessing = ref(false)
  const showSuccessCircle = ref(false)
  const paymentForm = ref<PaymentFormData>({
    amount: 0,
    paymentSource: PaymentSource.CLIENT,
    paymentRecovery: RecoverySource.AGENT,
  })

  // Methods
  async function processSettlement(settlementData: Liquidacion): Promise<void> {
    try {
      if (!settlementData) {
        handleError(new Error('Datos de liquidación no disponibles'), 'VALIDATION_ERROR')
        return
      }

      isProcessing.value = true

      // Fix identifier if necessary (2025/2026 -> 2024)
      const processedData = { ...settlementData }
      if (processedData.identificador.includes('2025') || processedData.identificador.includes('2026')) {
        processedData.identificador = processedData.identificador.replace(/202[56]/g, '2024')
      }

      // Set payment information
      processedData.quienPago = paymentForm.value.paymentSource
      processedData.recuperadoPor = paymentForm.value.paymentRecovery

      await settlementsService.createLiquidacion(processedData)
      
      handleSuccess(`Liquidación exitosa para ${processedData.cliente}`)
      showSuccessCircle.value = true
      
    } catch (error) {
      handleError(error, 'SETTLEMENT_PROCESS_FAILED')
    } finally {
      isProcessing.value = false
    }
  }

  function updatePaymentForm(updates: Partial<PaymentFormData>): void {
    paymentForm.value = {
      ...paymentForm.value,
      ...updates
    }
  }

  function resetProcessor(): void {
    isProcessing.value = false
    showSuccessCircle.value = false
    paymentForm.value = {
      amount: 0,
      paymentSource: PaymentSource.CLIENT,
      paymentRecovery: RecoverySource.AGENT,
    }
  }

  function hideSuccessMessage(): void {
    showSuccessCircle.value = false
  }

  return {
    // State
    isProcessing,
    showSuccessCircle,
    paymentForm,
    
    // Methods
    processSettlement,
    updatePaymentForm,
    resetProcessor,
    hideSuccessMessage
  }
}