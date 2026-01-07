import { ref, computed, type Ref } from 'vue'
import type { ISpecialSettlement, IPayloadSpecialSettlement, IPaymentFormData, Liquidacion } from '../types'
import { PaymentSource, RecoverySource } from '@/features/loan/types'
import { settlementsService } from '../services/settlements.service'
import { useSettlementErrorHandler } from './useSettlementErrorHandler'
import { useErrorDialogStore } from '@/shared/stores'
import { useRevealCircle } from '@/shared/composables/useRevealCircle'

export function useSettlement() {
  // Services and composables
  const { handleError, handleSuccess } = useSettlementErrorHandler()
  const errorDialogStore = useErrorDialogStore()
  const { isVisible: isRevealCircleVisible, config: revealCircleConfig, showRevealCircle, hideRevealCircle } = useRevealCircle()

  // === SPECIAL SETTLEMENT STATE ===
  const specialSettlement: Ref<ISpecialSettlement | null> = ref(null)
  const selectedDiscountPercentage = ref<number>(0)

  // === SHARED STATE ===
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isProcessing = ref(false)
  const paymentForm = ref<IPaymentFormData>({
    amount: 0,
    paymentSource: PaymentSource.CLIENT,
    paymentRecovery: RecoverySource.AGENT,
  })

  // === SPECIAL SETTLEMENT COMPUTED ===
  const liquidationOptions = computed(() => {
    if (!specialSettlement.value) return []

    return [
      {
        percentage: 10,
        discount: 'DESC',
        amount: specialSettlement.value.liquida_con_10_porciento,
      },
      {
        percentage: 20,
        discount: 'DESC',
        amount: specialSettlement.value.liquida_con_20_porciento,
      },
      {
        percentage: 30,
        discount: 'DESC',
        amount: specialSettlement.value.liquida_con_30_porciento,
        payAmount: specialSettlement.value.saldo * 0.7
      },
      {
        percentage: 40,
        discount: 'DESC',
        amount: specialSettlement.value.liquida_con_40_porciento,
      },
      {
        percentage: 50,
        discount: 'DESC',
        amount: specialSettlement.value.liquida_con_50_porciento,
      }
    ]
  })

  const hasSpecialData = computed(() => specialSettlement.value !== null)
  const canSettle = computed(() => (specialSettlement.value && specialSettlement.value?.semanas_transcurridas >= 52) ? true : false)

  // === SPECIAL SETTLEMENT METHODS ===
  async function fetchSpecialSettlement(loanId: string) {
    loading.value = true
    error.value = null
    specialSettlement.value = null

    try {
      const response = await settlementsService.getSpecialSettlement(loanId)
      console.log('Fetched special settlement:', response.data)
      specialSettlement.value = response.data
    } catch (err) {
      console.error('Error fetching special settlement:', err)
      error.value = 'Error de conexión al obtener la liquidación especial'
    } finally {
      loading.value = false
    }
  }

  function creatPayloadSpecialSettlement() {
    if(!specialSettlement.value) return null
    const payload: IPayloadSpecialSettlement = {
      prestamo_id: specialSettlement.value.prestamo_id,
      descuento_dinero: specialSettlement.value.saldo - (liquidationOptions.value.find(option => option.percentage === selectedDiscountPercentage.value)?.amount || 0),
      descuento_porcentaje: selectedDiscountPercentage.value,
      liquida_con: liquidationOptions.value.find(option => option.percentage === selectedDiscountPercentage.value)?.amount || 0,
      sem_transcurridas: specialSettlement.value.semanas_transcurridas,
      recuperado_por: paymentForm.value.paymentRecovery,
      status_recuperacion: specialSettlement.value.status_recuperacion,
      comentario: paymentForm.value.paymentSource
    }

    console.log('Created settlement payload:', payload)
    return payload
  }

  function selectLiquidationOption(percentage: number) {
    selectedDiscountPercentage.value = percentage
  }

  // === REGULAR SETTLEMENT METHODS ===
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

      await settlementsService.createSettlement(processedData)
      handleSuccess(`Liquidación exitosa para ${processedData.cliente}`)

      // Show success RevealCircle
      showRevealCircle({
        type: 'success',
        mainText: 'Liquidación exitosa',
        secondaryText: `Se guardó con éxito la liquidación de ${processedData.cliente}`
      })
    } catch (error) {
      const errorCode = (error as any)?.code || 'UNKNOWN_ERROR'
      errorDialogStore.showSimpleError(
        "¡Ups! Algo no ocurrió como se esperaba",
        "Hubo un problema al procesar la creación de la liquidación",
        errorCode)
    } finally {
      isProcessing.value = false
    }
  }

  async function processSpecialSettlement(): Promise<void> {
    try {
      isProcessing.value = true
      const specialData = creatPayloadSpecialSettlement()
      if (!specialData) {
        handleError(new Error('No se pudo crear la liquidación especial'), 'VALIDATION_ERROR')
        return
      }

      console.log('Processing special settlement:', specialData)
      await settlementsService.createSpecialSettlement(specialData)

      // Show success RevealCircle for special settlement
      showRevealCircle({
        type: 'success',
        mainText: 'Liquidación Especial Exitosa',
        secondaryText: `Se procesó exitosamente la liquidación especial de ${specialSettlement.value?.cliente} con ${selectedDiscountPercentage.value}% de descuento`
      })
    } catch (error) {
      const errorCode = (error as any)?.code || 'UNKNOWN_ERROR'
      errorDialogStore.showSimpleError(
        "¡Ups! Algo no ocurrió como se esperaba",
        "Hubo un problema al procesar la liquidación especial",
        errorCode)
    } finally {
      isProcessing.value = false
    }
  }

  // === SHARED UTILITY METHODS ===
  function updatePaymentForm(updates: Partial<IPaymentFormData>): void {
    paymentForm.value = {
      ...paymentForm.value,
      ...updates
    }
  }

  function resetProcessor(): void {
    isProcessing.value = false
    hideRevealCircle()
    paymentForm.value = {
      amount: 0,
      paymentSource: PaymentSource.CLIENT,
      paymentRecovery: RecoverySource.AGENT,
    }
  }

  function hideSuccessMessage(): void {
    hideRevealCircle()
  }

  function formatWeekYear(week: number, year: number): string {
    return `Sem ${week} (${year})`
  }

  function clearSpecialData() {
    specialSettlement.value = null
    error.value = null
    selectedDiscountPercentage.value = 0
  }

  return {
    // === SPECIAL SETTLEMENT STATE ===
    specialSettlement,
    selectedDiscountPercentage,
    liquidationOptions,
    hasSpecialData,
    canSettle,

    // === SHARED STATE ===
    loading,
    error,
    isProcessing,
    paymentForm,

    // === REVEAL CIRCLE STATE ===
    isRevealCircleVisible,
    revealCircleConfig,

    // === SPECIAL SETTLEMENT METHODS ===
    fetchSpecialSettlement,
    selectLiquidationOption,
    processSpecialSettlement,
    clearSpecialData,

    // === REGULAR SETTLEMENT METHODS ===
    processSettlement,

    // === SHARED UTILITY METHODS ===
    updatePaymentForm,
    resetProcessor,
    hideSuccessMessage,
    formatWeekYear,
  }
}