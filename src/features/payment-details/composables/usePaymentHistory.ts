import { computed, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { latLng, type LatLng } from 'leaflet'
import type { IPayment } from '../types'
import type { ILoan } from '@/features/loan/types'
import { loanAndPaymentService } from '@/features/loan/services/loan.service'
import { paymentDetailsService } from '../services/payment-details.service'
import { useNotification } from '@/shared/composables/useNotification'

export function usePaymentHistory() {
  // Services and composables initialization
  const $store = useStore()
  const { showError } = useNotification()

  // State definitions
  const historyList = ref<IPayment[]>([])
  const loanData = ref<ILoan>()
  const isMapVisible = ref(false)
  const mapMarker = ref<LatLng>()
  const loadError = ref(false)

  // Computed properties
  const isLoading = computed(() => $store.loading)
  const hasLoanData = computed(() => !!loanData.value)
  const hasHistoryData = computed(() => historyList.value.length > 0)

  // Methods
  // soloPagos: quien consulta desde una solicitud solo necesita los pagos, y el
  // crédito puede estar archivado (FAX /prestamos/{id} lee prestamos_view, que
  // solo trae activos: pedirlo daría 404 y su aviso).
  async function loadLoanHistory(loanId: string, { soloPagos = false } = {}): Promise<void> {
    if (!loanId) {
      showError('ID de préstamo no proporcionado')
      return
    }

    $store.loading = true
    loadError.value = false

    try {
      if (soloPagos) {
        const historyResponse = await paymentDetailsService.getLoanPayments(loanId, { sinAviso: true })
        historyList.value = historyResponse.data.pagos
        return
      }

      // Execute requests in parallel for better performance
      const [loanResponse, historyResponse] = await Promise.all([
        loanAndPaymentService.getLoanById(loanId),
        paymentDetailsService.getLoanPayments(loanId)
      ])

      loanData.value = loanResponse.data
      historyList.value = historyResponse.data.pagos
    } catch (error) {
      console.error('Error al cargar historial de pagos:', error)
      loadError.value = true
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

  function startNavigation(): void {
    if (!mapMarker.value) return
    const { lat, lng } = mapMarker.value
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function showPaymentLocation(payment: IPayment): void {
    if (!payment.lat || !payment.lng) return
    const position = latLng(payment.lat, payment.lng)
    showMap(position)
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
    loadError,

    // Computed
    isLoading,
    hasLoanData,
    hasHistoryData,

    // Methods
    loadLoanHistory,
    hideMap,
    showMap,
    showPaymentLocation,
    startNavigation,
    clearData
  }
}