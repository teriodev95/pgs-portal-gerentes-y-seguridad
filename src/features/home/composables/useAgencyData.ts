// composables/useAgencyData.ts
import { computed, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { useToast } from 'vue-toast-notification'
import { commonService } from '@/shared/services/modules'

export function useAgencyData() {
  const $store = useStore()
  const $toast = useToast()

  const isAgencySelectEnabled = ref(true)

  // Computed properties from store
  const agencies = computed(() => $store.agencies)
  const agencySelected = computed(() => $store.agencySelected)
  const currentDate = computed(() => $store.currentDate)
  const gerencias = computed(() => $store.gerencias)
  const sucursales = computed(() => $store.sucursales)

  /**
   * Fetches agency details from the API
   */
  async function fetchAgencyDetails() {
    if (!agencySelected.value || !currentDate.value) {
      console.warn('Cannot fetch agency details: missing agency or date')
      return false
    }

    try {
      const agencyResponse = await commonService.getAgency({
        agency: agencySelected.value as string,
        week: currentDate.value.week,
        year: currentDate.value.year
      })

      $store.agencyData = agencyResponse.data
      return true
    } catch (error) {
      console.error('Error fetching agency details:', error)
      return false
    }
  }

  /**
   * Handles agency selection action
   * Fetches all required data for the selected agency
   */
  async function handleAgencySelection(fetchCollectionDataFn: () => Promise<boolean>) {
    isAgencySelectEnabled.value = false
    $store.loading = true

    try {
      // Fetch data in parallel for better performance
      const [collectionsSuccess, agencySuccess] = await Promise.all([
        fetchCollectionDataFn(),
        fetchAgencyDetails()
      ])

      if (!collectionsSuccess || !agencySuccess) {
        $toast.error('Error al cargar los datos de la agencia seleccionada')
      }
    } catch (error) {
      console.error('Error handling agency selection:', error)
      $toast.error('Error al cargar los datos')
    } finally {
      $store.loading = false
      isAgencySelectEnabled.value = true
    }
  }

  return {
    // State
    isAgencySelectEnabled,
    
    // Computed
    agencies,
    agencySelected,
    currentDate,
    gerencias,
    sucursales,
    
    // Methods
    fetchAgencyDetails,
    handleAgencySelection
  }
}