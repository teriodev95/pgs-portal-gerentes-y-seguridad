import { computed, onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { ROUTE_NAME } from '@/router'
import type { IAgencyFinancialSummary, ISalidasSemana } from '../types/agency.types'
import { entityService } from '../services/entity.service'

export function useAgencyDetails() {
  // Services, Composables and Stores initialization
  const $router = useRouter()
  const $store = useStore()

  // State definitions
  const dashboardData = ref<IAgencyFinancialSummary>()
  const dateSelector = ref<string>()
  const isDatePickerVisible = ref(false)
  const salidas = ref<ISalidasSemana>()

  // Computed properties
  const agency = computed(() => $store.agencyData)
  const hasSalidas = computed(() => (salidas.value?.salidas.length ?? 0) > 0 || (salidas.value?.porTerminar.length ?? 0) > 0)
  const isLoading = ref(false)

  // Methods
  function navigateToHome(): void {
    void $router.push({
      name: ROUTE_NAME.DASHBOARD_HOME
    })
  }

  function toggleDatePicker(): void {
    isDatePickerVisible.value = !isDatePickerVisible.value
  }

  async function fetchDashboardByDate(event: Event): Promise<void> {
    if (!agency.value) return

    try {
      isLoading.value = true
      dashboardData.value = undefined

      const value = (event.target as HTMLInputElement).value
      dateSelector.value = value.replace(/\//g, '-')

      // Convert date from YYYY-MM-DD to DD-MM-YYYY format for API
      const [year, month, day] = dateSelector.value.split('-')
      const formattedDate = `${year}-${month}-${day}`
      console.log('Formatted Date for API:', formattedDate);

      const response = await entityService.getAgencyDashboard(
        agency.value.agencia,
        formattedDate
      )

      dashboardData.value = response.data
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      isLoading.value = false
    }
  }

  function navigateToLoanDetails(prestamoId: string): void {
    void $router.push({
      name: ROUTE_NAME.DASHBOARD_PRESTAMO,
      query: { prestamo: prestamoId }
    })
  }

  async function fetchSalidasSemana(): Promise<void> {
    if (!agency.value?.agencia) return

    isLoading.value = true

    try {
      const { data } = await entityService.getSalidasSemana(agency.value.agencia)
      salidas.value = data
    } catch (error) {
      console.error('Error fetching salidas de la semana:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Lifecycle hooks
  onBeforeMount(async () => {
    await fetchSalidasSemana()
  })

  return {
    // State
    dashboardData,
    dateSelector,
    isDatePickerVisible,
    salidas,
    isLoading,

    // Computed
    agency,
    hasSalidas,

    // Methods
    navigateToHome,
    navigateToLoanDetails,
    toggleDatePicker,
    fetchDashboardByDate,
    fetchSalidasSemana
  }
}