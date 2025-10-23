// composables/useCollections.ts
import { computed, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { commonService } from '@/shared/services/modules'
import type { FilterOptions as FilterModel } from '@/shared/components/FilterButton.vue'

export function useCollections() {
  const $store = useStore()
  const $router = useRouter()

  const searchTerm = ref<string>()
  const filterOptions = ref<FilterModel>({
    completed: true,
    desfase: true,
    partial: true,
    pending: true
  })

  // Store computed properties
  const isLoading = computed(() => $store.loading)
  const agencySelected = computed(() => $store.agencySelected)
  const currentDate = computed(() => $store.currentDate)

  /**
   * Filtered collections based on search and filter options
   */
  const filteredCollections = computed(() => {
    if (!$store.cobranzas) return []

    return $store.cobranzas
      .filter(collection => {
        // Apply status filters
        if (!filterOptions.value.completed && collection.status === 'Completado') return false
        if (!filterOptions.value.desfase && collection.status === 'Desfase') return false
        if (!filterOptions.value.partial && collection.status === 'Parcial') return false
        if (!filterOptions.value.pending && collection.status === 'Pendiente') return false
        return true
      })
      .filter(collection => {
        // Apply search filter if search term exists
        if (!searchTerm.value) return true

        const term = searchTerm.value.toLocaleLowerCase()
        const nameMatch = collection.nombre.toLocaleLowerCase().includes(term)
        const idMatch = collection.prestamoId.toString().includes(term)

        return nameMatch || idMatch
      })
  })

  /**
   * Navigates to loan details page
   */
  function navigateToLoanDetails(loanId: number | string) {
    $router.push({
      name: ROUTE_NAME.DASHBOARD_PRESTAMO,
      query: { prestamo: loanId }
    })
  }

  /**
   * Fetches collection data from the API
   */
  async function fetchCollectionData() {
    if (!agencySelected.value || !currentDate.value) {
      console.warn('Cannot fetch collection data: missing agency or date')
      return false
    }

    try {
      // Clear existing collection data first to avoid showing stale data
      $store.cobranzas = []

      const { data } = await commonService.getCobranza({
        agency: agencySelected.value as string,
        week: currentDate.value.week,
        year: currentDate.value.year
      })

      $store.cobranzas = data.cobranza
      return true
    } catch (error) {
      console.error('Error fetching collection data:', error)
      return false
    }
  }

  /**
   * Resets search term
   */
  function resetSearchTerm() {
    searchTerm.value = undefined
  }

  return {
    // State
    searchTerm,
    filterOptions,
    
    // Computed
    isLoading,
    filteredCollections,
    
    // Methods
    navigateToLoanDetails,
    fetchCollectionData,
    resetSearchTerm
  }
}