import { commonService } from '@/shared/services/modules'
import { computed, ref } from 'vue'
import { getFullTimestamp } from '@/shared/utils'
import { loanAndPaymentService } from '../services/loan.service'
import { useStore } from '@/shared/stores'
import { useToast } from 'vue-toast-notification'
import type { ICobranza  } from '@/interfaces'
import type { PaymentSource, RecoverySource, IPaymentCreate } from '../types'
import useGeolocation from '@/shared/composables/useGeolocation'

export function usePaymentManagement() {
  const $store = useStore()
  const $toast = useToast()
  const { userLocation, hasPermission } = useGeolocation()

  const isLoadingPayments = ref(false)
  const isProcessing = ref(false)
  const selectedAmount = ref(0)
  const selectedPayment = ref<ICobranza>()

  // Computed properties
  const agencySelected = computed(() => $store.agencySelected)
  const currentDate = computed(() => $store.currentDate)

  /**
   * Loads the payments data from the API
   */
  async function loadPayments() {
    try {
      isLoadingPayments.value = true
      $store.cobranzas = []

      const { data } = await commonService.getCobranza({
        agency: agencySelected.value as string,
        week: currentDate.value.week,
        year: currentDate.value.year
      })

      $store.cobranzas = data.cobranza
    } catch (error) {
      $toast.error('Error al obtener las cobranzas')
    } finally {
      isLoadingPayments.value = false
    }
  }

  /**
   * Processes a payment for the selected client
   */
  async function processPayment(
    amount: number, 
    selectedPaymentSource: PaymentSource, 
    selectedPaymentRecovery: RecoverySource
  ) {
    if (!selectedPayment.value) return false

    const payment = selectedPayment.value
    try {
      selectedAmount.value = amount
      isProcessing.value = true

      const { data: loan } = await loanAndPaymentService.getLoanById(`${payment.prestamoId}`)

      const paymentData: IPaymentCreate = {
        agente: agencySelected.value as string,
        anio: currentDate.value.year,
        cliente: payment.nombre,
        comentario: `'Llenado por el Gerente ${$store.user?.nombre}'`,
        creadoDesde: 'PGS',
        fechaPago: getFullTimestamp(),
        identificador: loan.identificadorCredito,
        lat: userLocation.value?.lat || 0,
        lng: userLocation.value?.lng || 0,
        log: '{}',
        monto: amount,
        pagoId: window.crypto.randomUUID(),
        prestamo: `${payment.prestamoId}`,
        prestamoId: `${payment.prestamoId}`,
        quienPago: selectedPaymentSource,
        recuperadoPor: selectedPaymentRecovery,
        semana: currentDate.value.week,
        tarifa: payment.tarifa,
        tipo: 'Pago',
      }

      console.log('Payment data:', paymentData)

      await loanAndPaymentService.createPayment(paymentData)

      // Solo mostrar advertencia si no hay permisos de geolocalización
      if (!hasPermission.value) {
        $toast.warning('No se guardó la ubicación. Los permisos de localización están desactivados.')
      }

      await loadPayments()
      return true
    } catch (error) {
      $toast.error(error instanceof Error ? error.message : 'Error al procesar el pago')
      return false
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Selects a payment for processing
   */
  function selectPaymentForProcessing(payment: ICobranza) {
    selectedPayment.value = payment
  }

  /**
   * Resets selected payment data
   */
  function resetSelectedPayment() {
    selectedAmount.value = 0
    selectedPayment.value = undefined
  }

  return {
    // State
    isLoadingPayments,
    isProcessing,
    selectedAmount,
    selectedPayment,
    
    // Methods
    loadPayments,
    processPayment,
    selectPaymentForProcessing,
    resetSelectedPayment
  }
}