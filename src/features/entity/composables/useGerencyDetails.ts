import { computed, onBeforeMount, ref } from 'vue'
import { entityService } from '../services/entity.service'
import { useStore } from '@/shared/stores'
import type { IManagementDashboard, IManagementDebts } from '@/features/entity/types'
import { useEntityErrorHandler } from './useEntityErrorHandler'

export function useGerencyDetails() {
  const $store = useStore()
  const { handleError } = useEntityErrorHandler()

  const dashboardData = ref<IManagementDashboard>()
  const managementDebts = ref<IManagementDebts>()
  const currentDate = computed(() => $store.currentDate)
  const management = computed(() => $store.gerenciaSelected)
  const isLoading = computed(() => $store.loading)


  async function getDashboard() {
    if (management.value) {
      try {
        $store.loading = true
        dashboardData.value = undefined

        const { data } = await entityService.getNewGerencyDashboard({
          managment: management.value,
          week: currentDate.value.week,
          year: currentDate.value.year,
        })


        const { data: managementDebtsResponse } = await entityService.getManagementDebts({
          managment: management.value,
          week: currentDate.value.week,
          year: currentDate.value.year,
        })

        managementDebts.value = managementDebtsResponse

        dashboardData.value = data
      } catch (error) {
        handleError(error, 'GERENCY_DASHBOARD_LOAD_FAILED')
      }
      $store.loading = false
    }
  }

  onBeforeMount(() => {
    getDashboard()
  })

  return {
    dashboardData,
    isLoading,
    management,
    managementDebts: computed(() => managementDebts.value),
    getDashboard,
  }
}