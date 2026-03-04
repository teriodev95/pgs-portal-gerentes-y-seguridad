import { ref, computed, watch } from 'vue'
import { useStore } from '@/shared/stores'
import { soliFilterService } from '../services/soliFilter.service'
import { useSoliFilterErrorHandler } from './useSoliFilterErrorHandler'
import type { SoliFilterListItem, SoliFilterListResponse } from '../types/soliFilter.types'

function normalizeSolicitudes(payload: unknown): SoliFilterListItem[] {
  if (Array.isArray(payload)) {
    return payload as SoliFilterListItem[]
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nestedData = (payload as SoliFilterListResponse).data
    return Array.isArray(nestedData) ? nestedData : []
  }

  return []
}

export function useSoliFilterList() {
  const $store = useStore()
  const { handleNetworkError } = useSoliFilterErrorHandler()

  const solicitudes = ref<SoliFilterListItem[]>([])
  const isLoading = ref(false)

  const gerencia = computed(() =>
    $store.gerenciaSelected || $store.user?.gerencia || $store.gerencias[0]?.gerencia || ''
  )

  async function fetchSolicitudes(): Promise<void> {
    const ger = gerencia.value?.trim()
    if (!ger) {
      solicitudes.value = []
      return
    }

    isLoading.value = true
    try {
      const { data: responseWrapper } = await soliFilterService.getSolicitudes(ger)
      solicitudes.value = normalizeSolicitudes(responseWrapper)
    } catch (error) {
      handleNetworkError(error)
      solicitudes.value = []
    } finally {
      isLoading.value = false
    }
  }

  watch(
    [gerencia, () => $store.gerencias.length, () => $store.user?.gerencia],
    () => {
      fetchSolicitudes()
    },
    { immediate: true }
  )

  return {
    solicitudes,
    isLoading,
    gerencia,
    fetchSolicitudes,
  }
}
