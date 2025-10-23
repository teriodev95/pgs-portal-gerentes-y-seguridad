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
  const showRevealCircle = ref(false)

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
   * Shows the success reveal circle
   */
  function showSuccessReveal() {
    showRevealCircle.value = true
  }

  /**
   * Handles closing the success circle and resetting selected values
   */
  function handleCancelRevealCircle(resetCallback: () => void) {
    showRevealCircle.value = false

    setTimeout(() => {
      resetCallback()
    }, 1000)
  }

  return {
    // Refs
    formCreatePaymentBS,
    showRevealCircle,
    
    // Computed
    isFromWeeklyClosureError,
    payments,
    
    // Methods
    openPaymentForm,
    closePaymentForm,
    showSuccessReveal,
    handleCancelRevealCircle
  }
}