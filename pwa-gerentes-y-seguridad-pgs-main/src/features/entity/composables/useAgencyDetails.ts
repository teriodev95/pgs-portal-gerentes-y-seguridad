import { computed, onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { ROUTE_NAME } from '@/router'
import type { IAgencyFinancialSummary, ILoansAboutToEnd } from '../types/agency.types'
import { entityService } from '../services/entity.service'
import { useEntityErrorHandler } from './useEntityErrorHandler'

export function useAgencyDetails() {
  // Services, Composables and Stores initialization
  const $router = useRouter()
  const $store = useStore()
  const { handleError } = useEntityErrorHandler()

  // State definitions
  const dashboardData = ref<IAgencyFinancialSummary>()
  const dateSelector = ref<string>()
  const isDatePickerVisible = ref(false)
  const loansAboutToEnd = ref<ILoansAboutToEnd>()

  // Computed properties
  const agency = computed(() => $store.agencyData)
  const currentDate = computed(() => $store.currentDate)
  const hasLoansToFinish = computed(() => (loansAboutToEnd.value?.prestamos.length ?? 0) > 0)
  const isLoading = computed(() => $store.loading)

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
      $store.loading = true
      dashboardData.value = undefined

      const value = (event.target as HTMLInputElement).value
      dateSelector.value = value.replace(/\//g, '-')

      // Convert date from YYYY-MM-DD to DD-MM-YYYY format for API
      const [year, month, day] = dateSelector.value.split('-')
      const formattedDate = `${day}-${month}-${year}`

      const response = await entityService.getAgencyDashboard(
        agency.value.agencia,
        formattedDate
      )

      dashboardData.value = response.data
    } catch (error) {
      handleError(error, 'DASHBOARD_BY_DATE_LOAD_FAILED')
    } finally {
      $store.loading = false
    }
  }

  async function fetchLoansAboutToEnd(): Promise<void> {
    if (!agency.value?.agencia) return

    try {
      const { data } = await entityService.getLoansAboutToEnd({
        agency: agency.value.agencia,
        week: currentDate.value.week,
        year: currentDate.value.year
      })

      loansAboutToEnd.value = data
    } catch (error) {
      handleError(error, 'LOANS_ABOUT_TO_END_LOAD_FAILED')
    }
  }

  // Lifecycle hooks
  onBeforeMount(() => {
    void fetchLoansAboutToEnd()
  })

  return {
    // State
    dashboardData,
    dateSelector,
    isDatePickerVisible,
    loansAboutToEnd,
    
    // Computed
    agency,
    currentDate,
    hasLoansToFinish,
    isLoading,
    
    // Methods
    navigateToHome,
    toggleDatePicker,
    fetchDashboardByDate,
    fetchLoansAboutToEnd
  }
}