import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { ROUTE_NAME } from '@/router'
import type { ILoan } from '../types'

export function useNavigation() {
  const $router = useRouter()
  const $store = useStore()

  // Computed properties
  const isRegionalButtonDisabled = computed(() => $store.user?.tipo === 'Regional')

  const navigationBackPath = computed(() => {
    if ($router.options.history.state.back === '/agency' || $router.options.history.state.back === '/call-center') {
      return true
    }
    return { name: ROUTE_NAME.DASHBOARD_HOME }
  })

  // Methods
  function navigateToPaymentHistory(loanData: ILoan | undefined) {
    if (!loanData) return
    
    void $router.push({
      name: ROUTE_NAME.DASHBOARD_HISTORIAL_PAGO,
      query: {
        prestamo: loanData.prestamoId
      }
    })
  }

  function navigateToSettlements(loanData: ILoan | undefined) {
    if (!loanData) return
    
    void $router.push({
      name: ROUTE_NAME.SETTLEMENTS,
      query: {
        prestamo: loanData.prestamoId
      }
    })
  }

  return {
    // Computed
    isRegionalButtonDisabled,
    navigationBackPath,
    
    // Methods
    navigateToPaymentHistory,
    navigateToSettlements
  }
}