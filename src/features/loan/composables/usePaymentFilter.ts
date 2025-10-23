// composables/usePaymentFilters.ts
import { ref } from 'vue'
import type { ICobranza } from '@/interfaces'
import type { FilterOptions as FilterModel } from '@/shared/components/FilterButton.vue'
import type { ItemSearchFilter } from '@/shared/composables/useItemRenderer'

// Constants
const PAYMENT_STATUSES = {
  completed: 'Completado',
  desfase: 'Desfase',
  partial: 'Parcial',
  pending: 'Pendiente'
} as const

export function usePaymentFilters() {
  const filterName = ref('')
  const filterCheck = ref<FilterModel>({
    completed: true,
    desfase: true,
    partial: true,
    pending: true
  })

  /**
   * Filters payments based on search term and status filters
   */
  function getFilteredPayments(payments: ICobranza[]) {
    const searchTerm = filterName.value.toLowerCase()
    const activeFilters = Object.entries(filterCheck.value)
      .filter(([_, isEnabled]) => !isEnabled)
      .map(([key]) => PAYMENT_STATUSES[key as keyof typeof PAYMENT_STATUSES])

    return payments.filter(payment =>
      payment.nombre.toLowerCase().includes(searchTerm) &&
      !activeFilters.includes(payment.status)
    )
  }

  /**
   * Handler for search filter selection
   */
  function selectPayment(reporteSelect: ItemSearchFilter) {
    filterName.value = (reporteSelect as ICobranza).nombre
  }

  return {
    // State
    filterName,
    filterCheck,
    
    // Methods
    getFilteredPayments,
    selectPayment
  }
}