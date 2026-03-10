// composables/usePaymentUIState.ts
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import type { ICobranza } from '@/interfaces'
import type VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

export function usePaymentUIState() {
  const $router = useRouter()
  const $store = useStore()

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
    closePaymentForm
  }
}