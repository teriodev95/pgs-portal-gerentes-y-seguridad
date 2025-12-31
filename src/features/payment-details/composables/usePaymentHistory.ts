import { computed, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { latLng, type LatLng } from 'leaflet'
import type { IPayment } from '../types'
import type { ILoan } from '@/features/loan/types'
import { loanAndPaymentService } from '@/features/loan/services/loan.service'
import { paymentDetailsService } from '../services/payment-details.service'
import { usePaymentDetailsErrorHandler } from './usePaymentHistoryErrorHandler'

export function usePaymentHistory() {
  // Services and composables initialization
  const $store = useStore()
  const { handleError } = usePaymentDetailsErrorHandler()

  // State definitions
  const historyList = ref<IPayment[]>([])
  const loanData = ref<ILoan>()
  const isMapVisible = ref(false)
  const mapMarker = ref<LatLng>()

  // Computed properties
  const isLoading = computed(() => $store.loading)
  const hasLoanData = computed(() => !!loanData.value)
  const hasHistoryData = computed(() => historyList.value.length > 0)

  // Methods
  async function loadLoanHistory(loanId: string): Promise<void> {
    if (!loanId) {
      handleError(new Error('ID de préstamo no proporcionado'), 'UNKNOWN_ERROR')
      return
    }

    $store.loading = true

    try {
      // Execute requests in parallel for better performance
      const [loanResponse, historyResponse] = await Promise.all([
        loanAndPaymentService.getLoanById(loanId),
        paymentDetailsService.getLoanPayments(loanId)
      ])

      loanData.value = loanResponse.data
      historyList.value = historyResponse.data.pagos
    } catch (error) {
      handleError(error, 'LOAD_FAILED')
    } finally {
      $store.loading = false
    }
  }

  function hideMap(): void {
    isMapVisible.value = false
    mapMarker.value = undefined
  }

  function showMap(position: LatLng): void {
    isMapVisible.value = true
    mapMarker.value = position
  }

  function showPaymentLocation(payment: IPayment): void {
    //const position = latLng(payment.lat, payment.lng)
    //showMap(position)
  }

  function clearData(): void {
    historyList.value = []
    loanData.value = undefined
    hideMap()
  }

  return {
    // State
    historyList,
    loanData,
    isMapVisible,
    mapMarker,

    // Computed
    isLoading,
    hasLoanData,
    hasHistoryData,

    // Methods
    loadLoanHistory,
    hideMap,
    showMap,
    showPaymentLocation,
    clearData
  }
}