import { computed, onBeforeMount, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { type LatLng, type PointExpression } from 'leaflet'
import { noPaymentService } from '../services/no-payment.service'
import type { INoPago, IVisita } from '../types'
import { useNoPaymentFilters } from './useNoPaymentFilters'

export function useNoPayments() {
  // Services and stores
  const $store = useStore()

  // Filter composable
  const {
    agencyList,
    selectedAgency,
    managementList,
    selectedManagement,
    hasVisit,
    isLoadingFilters,
    isUserManager,
    fetchManagements,
    fetchAgencies,
    getFilteredNoPayments
  } = useNoPaymentFilters()

  // State definitions
  const noPaymentsList = ref<INoPago[]>()
  const selectedVisit = ref<IVisita>()
  const isLoading = ref(false)
  const isMapDrawerOpen = ref(false)

  // Map state
  const mapCenter = ref<PointExpression>([0, 0])
  const mapMarker = ref<LatLng>()
  const mapZoom = ref<number>(10)

  // Computed properties
  const currentDate = computed(() => $store.currentDate)
  const hasPayments = computed(() => noPaymentsList.value?.length !== 0)
  const isFilterDisabled = computed(() => isLoading.value || isLoadingFilters.value)

  const filteredNoPayments = computed(() => {
    if (!noPaymentsList.value) return []
    return getFilteredNoPayments(noPaymentsList.value)
  })

  const hasPaymentsFiltered = computed(() => filteredNoPayments.value.length !== 0)

  // Methods
  async function fetchNoPayments(): Promise<void> {
    if (!$store.user?.usuario) return

    try {
      isLoading.value = true
      const { data } = await noPaymentService.getNoPagos({
        agency: selectedAgency.value,
        week: currentDate.value.week,
        year: currentDate.value.year
      })
      console.log('Fetched No Payments:', data)
      noPaymentsList.value = data
    } catch (error) {
      console.error('Error fetching no payments:', error)
    } finally {
      isLoading.value = false
    }
  }

  function showMapLocation(coordinates: LatLng): void {
    mapMarker.value = coordinates
    mapCenter.value = [coordinates.lat, coordinates.lng]
    mapZoom.value = 10
    isMapDrawerOpen.value = true
  }

  function closeMapDrawer(): void {
    isMapDrawerOpen.value = false
  }

  function selectVisit(visit: IVisita): void {
    selectedVisit.value = visit
  }

  async function initializeData(): Promise<void> {
    try {
      isLoading.value = true
      await fetchManagements()
      await fetchAgencies()
    } catch (error) {
      console.error('Initialization error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Lifecycle hooks
  onBeforeMount(async () => {
    await initializeData()
  })

  return {
    // State
    noPaymentsList,
    selectedVisit,
    isLoading,
    isMapDrawerOpen,

    // Map state
    mapCenter,
    mapMarker,
    mapZoom,

    // Filter state (from useNoPaymentFilters)
    agencyList,
    selectedAgency,
    managementList,
    selectedManagement,
    hasVisit,
    isLoadingFilters,

    // Computed - Basic
    currentDate,
    isUserManager,

    // Computed - Specific
    hasPayments,
    hasPaymentsFiltered,
    isFilterDisabled,
    filteredNoPayments,

    // Methods
    fetchNoPayments,
    fetchAgencies,
    showMapLocation,
    closeMapDrawer,
    selectVisit,
    initializeData
  }
}