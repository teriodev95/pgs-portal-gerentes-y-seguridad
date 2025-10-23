import { computed, onBeforeMount, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { type LatLng, type PointExpression } from 'leaflet'
import { noPaymentService } from '../services/no-payment.service'
import type { INoPago, IVisita } from '../types'
import { useNoPaymentErrorHandler } from './useNoPaymentErrorHandler'
import { useNoPaymentFilters } from './useNoPaymentFilters'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

export function useNoPayments() {
  // Services and stores
  const $store = useStore()
  const { handleError } = useNoPaymentErrorHandler()

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
  const mapBottomSheet = ref<InstanceType<typeof VueBottomSheet>>()

  // Map state
  const mapCenter = ref<PointExpression>([0, 0])
  const mapMarker = ref<LatLng>()
  const mapZoom = ref<number>(10)

  // Computed properties
  const currentDate = computed(() => $store.currentDate)
  const noPaymentsExist = computed(() => noPaymentsList.value?.length === 0)
  const isFilterDisabled = computed(() => isLoading.value || isLoadingFilters.value)

  const filteredNoPayments = computed(() => {
    if (!noPaymentsList.value) return []
    return getFilteredNoPayments(noPaymentsList.value)
  })

  // Methods
  async function fetchNoPayments(): Promise<void> {
    if (!$store.user?.usuario) return

    try {
      isLoading.value = true
      const { data } = await noPaymentService.getNoPagos({
        user: $store.user.usuario,
        week: currentDate.value.week,
        year: currentDate.value.year
      })
      noPaymentsList.value = data
    } catch (error) {
      handleError(error, 'NO_PAYMENTS_LOAD_FAILED')
    } finally {
      isLoading.value = false
    }
  }

  function showMapLocation(coordinates: LatLng): void {
    mapMarker.value = coordinates
    mapCenter.value = [coordinates.lat, coordinates.lng]
    mapZoom.value = 10
    mapBottomSheet.value?.open()
  }

  function selectVisit(visit: IVisita): void {
    selectedVisit.value = visit
  }

  async function initializeData(): Promise<void> {
    try {
      isLoading.value = true
      await Promise.all([
        fetchManagements(),
        fetchNoPayments()
      ])
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
    mapBottomSheet,

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
    noPaymentsExist,
    isFilterDisabled,
    filteredNoPayments,

    // Methods
    fetchNoPayments,
    fetchAgencies,
    showMapLocation,
    selectVisit,
    initializeData
  }
}