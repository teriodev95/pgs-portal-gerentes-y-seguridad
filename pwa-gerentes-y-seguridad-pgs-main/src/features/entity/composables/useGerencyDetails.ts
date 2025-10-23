import { computed, onBeforeMount, ref, watch } from 'vue'
import { entityService } from '../services/entity.service'
import { useStore } from '@/shared/stores'
import type { IManagementDashboard } from '@/features/entity/types'
import { useEntityErrorHandler } from './useEntityErrorHandler'

export function useGerencyDetails() {
  const $store = useStore()
  const { handleError } = useEntityErrorHandler()

  const dashboardData = ref<IManagementDashboard>()

  const currentDate = computed(() => $store.currentDate)
  const management = computed(() => $store.gerenciaSelected)
  const isLoading = computed(() => $store.loading)

  // Filter state
  const filterYear = ref<number>(currentDate.value.year)
  const filterWeek = ref<number>(currentDate.value.week)

  async function getDashboard() {
    if (management.value) {
      try {
        $store.loading = true
        dashboardData.value = undefined

        const { data } = await entityService.getNewGerencyDashboard({
          managment: management.value,
          week: filterWeek.value,
          year: filterYear.value
        })
        dashboardData.value = data
      } catch (error) {
        handleError(error, 'GERENCY_DASHBOARD_LOAD_FAILED')
      }
      $store.loading = false
    }
  }

  function updateFilters({ year, week }: { year?: number; week?: number }) {
    if (year !== undefined) {
      filterYear.value = year
    }
    if (week !== undefined) {
      filterWeek.value = week
    }
  }

  // Watch for filter changes to refetch data
  watch([filterYear, filterWeek], () => {
    getDashboard()
  })

  // Watch for current date changes to update filters
  watch(currentDate, (newDate) => {
    filterYear.value = newDate.year
    filterWeek.value = newDate.week
  })

  onBeforeMount(() => {
    getDashboard()
  })

  return {
    dashboardData,
    management,
    isLoading,
    filterYear,
    filterWeek,
    getDashboard,
    updateFilters
  }
}