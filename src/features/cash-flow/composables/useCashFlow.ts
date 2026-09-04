import { ref, computed, watch } from 'vue'
import { useStore } from '@/shared/stores/app'
import { cashFlowService } from '../services/cashFlow.service'
import { segmentosDe } from '../utils/segmentos'
import type { FlujoEfectivo } from '../types/cashFlow.types'

// Siempre la semana en curso: el flujo se revisa en vivo, no se navega.
export function useCashFlow() {
  const $store = useStore()

  const flujo = ref<FlujoEfectivo | null>(null)
  const loading = ref(false)

  const gerencia = computed(() => $store.gerenciaSelected ?? '')
  const semana = computed(() => $store.currentDate.week)
  const anio = computed(() => $store.currentDate.year)
  const barras = computed(() => (flujo.value ? segmentosDe(flujo.value.cubos) : null))

  async function fetchFlujo(): Promise<void> {
    // La semana llega del store un instante después de entrar; se espera a tenerla.
    if (!gerencia.value || !semana.value || !anio.value) return
    loading.value = true
    try {
      const { data } = await cashFlowService.getFlujo(gerencia.value, anio.value, semana.value)
      flujo.value = data.success ? data.data : null
    } catch (error) {
      console.error('CASH_FLOW_LOAD_FAILED', error)
      flujo.value = null
    } finally {
      loading.value = false
    }
  }

  watch([gerencia, semana, anio], fetchFlujo, { immediate: true })

  return { flujo, barras, loading, gerencia, semana, anio, fetchFlujo }
}
