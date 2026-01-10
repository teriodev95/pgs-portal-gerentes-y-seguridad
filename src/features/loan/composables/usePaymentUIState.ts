// composables/usePaymentUIState.ts
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { useRevealCircleStore } from '@/shared/stores/revealCircle'
import { formatToHumanDate, toCurrency } from '@/shared/utils'
import type { ICobranza } from '@/interfaces'
import type VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

export function usePaymentUIState() {
  const $router = useRouter()
  const $store = useStore()
  const revealCircleStore = useRevealCircleStore()

  const formCreatePaymentBS = ref<InstanceType<typeof VueBottomSheet>>()
  const selectedPayment = ref<ICobranza>()
  const selectedAmount = ref(0)

  // Computed properties
  const isFromWeeklyClosureError = computed(() =>
    $router.options.history.state.back === '/agency/cierre-error'
  )

  const payments = computed<ICobranza[]>(() => {
    if (isFromWeeklyClosureError.value) {
      return $store.cobranzasWithCrtp
    }
    return $store.cobranzas
  })

  /**
   * Opens the payment form bottom sheet
   */
  function openPaymentForm() {
    formCreatePaymentBS.value?.open()
  }

  /**
   * Closes the payment form bottom sheet
   */
  function closePaymentForm() {
    formCreatePaymentBS.value?.close()
  }

  /**
   * Shows the success reveal circle with payment details
   */
  function showSuccessReveal(payment: ICobranza, amount: number) {
    selectedPayment.value = payment
    selectedAmount.value = amount

    const transactionDetails = [
      `- Fecha de aplicación del pago: <span class='font-extrabold'>${formatToHumanDate(new Date(), true)}</span>`,
      `- Monto abonado: <span class='font-extrabold'>${toCurrency(amount)}</span>`
    ]

    revealCircleStore.showRevealCircle({
      type: 'success',
      mainText: '¡Pago registrado con éxito!',
      secondaryText: `Se ha registrado correctamente el pago de <span class='font-extrabold'>${payment.nombre}</span>`,
      subText: 'A continuación, los detalles de la transacción:',
      list: transactionDetails
    }, () => {
      // Reset selected payment after reveal circle closes
      selectedPayment.value = undefined
      selectedAmount.value = 0
    })
  }

  return {
    // Refs
    formCreatePaymentBS,
    selectedPayment,
    selectedAmount,

    // Computed
    isFromWeeklyClosureError,
    payments,

    // Methods
    openPaymentForm,
    closePaymentForm,
    showSuccessReveal
  }
}