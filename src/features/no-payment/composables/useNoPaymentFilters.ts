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
  const hasVisit = ref(false)
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
      selectedAgency.value = ''
    } catch (error) {
      handleError(error, 'AGENCIES_LOAD_FAILED')
    } finally {
      isLoadingFilters.value = false
    }
  }

  function getFilteredNoPayments(noPaymentsList: INoPago[]): INoPago[] {
    if (!noPaymentsList) return []

    if (selectedAgency.value === '') {
      return noPaymentsList.filter(
        (payment) => payment.gerencia === selectedManagement.value &&
          hasVisit.value === (payment.visitas.length > 0)
      )
    } else {
      return noPaymentsList.filter(
        (payment) => payment.gerencia === selectedManagement.value &&
          payment.agente === selectedAgency.value &&
          hasVisit.value === (payment.visitas.length > 0)
      )
    }
  }

  function resetFilters(): void {
    selectedAgency.value = ''
    hasVisit.value = false
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