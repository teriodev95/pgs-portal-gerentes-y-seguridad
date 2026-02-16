import { commonService } from '@/shared/services/modules'
import { computed, ref } from 'vue'
import { useNoPaymentErrorHandler } from './useNoPaymentErrorHandler'
import { useStore } from '@/shared/stores'
import type { INoPago } from '../types'

export function useNoPaymentFilters() {
  // Services and stores
  const $store = useStore()
  const { handleError } = useNoPaymentErrorHandler()

  // Filter state
  const agencyList = ref<string[]>()
  const selectedAgency = ref<string>('')
  const managementList = ref<string[]>()
  const selectedManagement = ref<string>('')
  const hasVisit = ref<boolean | null>(null) // null = show all, true = with visits, false = without visits
  const isLoadingFilters = ref(false)

  // Computed properties
  const user = computed(() => $store.user)
  const isUserManager = computed(() => $store.user?.tipo === 'Gerente')

  // Filter methods
  async function fetchManagements(): Promise<void> {
    if (!user.value?.usuario) return

    try {
      isLoadingFilters.value = true
      const { data } = await commonService.getGerenciesCopy(user.value.usuario)

      const managementNames: string[] = Object.values(data)
        .map((managements) => managements.map((management) => management.gerencia))
        .flat()

      managementList.value = managementNames
      selectedManagement.value = managementNames[0]
    } catch (error) {
      handleError(error, 'MANAGEMENTS_LOAD_FAILED')
    } finally {
      isLoadingFilters.value = false
    }
  }

  async function fetchAgencies(): Promise<void> {
    if (!selectedManagement.value) return

    try {
      isLoadingFilters.value = true
      const response = await commonService.getAgenciesCopy(selectedManagement.value)
      agencyList.value = response.data.map((agency) => agency.agencia)
      selectedAgency.value = agencyList.value[0] || ''
      
    } catch (error) {
      handleError(error, 'AGENCIES_LOAD_FAILED')
    } finally {
      isLoadingFilters.value = false
    }
  }

  function getFilteredNoPayments(noPaymentsList: INoPago[]): INoPago[] {
    if (!noPaymentsList) return []


    return noPaymentsList.filter((payment) => {

      // Filter by visits (only if hasVisit is not null)
      const matchesVisit = hasVisit.value === null ||
        (hasVisit.value === true && payment.visitas.length > 0) ||
        (hasVisit.value === false && payment.visitas.length === 0)

      return matchesVisit
    })
  }

  function resetFilters(): void {
    selectedAgency.value = ''
    hasVisit.value = null
  }

  return {
    // State
    agencyList,
    selectedAgency,
    managementList,
    selectedManagement,
    hasVisit,
    isLoadingFilters,

    // Computed
    user,
    isUserManager,

    // Methods
    fetchManagements,
    fetchAgencies,
    getFilteredNoPayments,
    resetFilters
  }
}