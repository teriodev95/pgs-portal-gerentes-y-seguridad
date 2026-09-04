import { ref, computed, watch, onBeforeMount } from 'vue'
import { useStore } from '@/shared/stores/app'
import { cashFlowService } from '../services/cashFlow.service'
import { segmentosDe } from '../utils/segmentos'
import type { FlujoEfectivo } from '../types/cashFlow.types'

const SEMANAS_POR_ANIO = 52

export function useCashFlow() {
  const $store = useStore()

  const flujo = ref<FlujoEfectivo | null>(null)
  const loading = ref(false)
  // Semana que se consulta; arranca en la actual y se puede ir hacia atrás.
  const semana = ref($store.currentDate.week)
  const anio = ref($store.currentDate.year)

  const gerencia = computed(() => $store.gerenciaSelected ?? '')
  const barras = computed(() => (flujo.value ? segmentosDe(flujo.value.cubos) : null))
  const esSemanaActual = computed(
    () => semana.value === $store.currentDate.week && anio.value === $store.currentDate.year,
  )

  function semanaAnterior(): void {
    if (semana.value > 1) {
      semana.value -= 1
      return
    }
    semana.value = SEMANAS_POR_ANIO
    anio.value -= 1
  }

  function semanaSiguiente(): void {
    if (esSemanaActual.value) return
    if (semana.value < SEMANAS_POR_ANIO) {
      semana.value += 1
      return
    }
    semana.value = 1
    anio.value += 1
  }

  async function fetchFlujo(): Promise<void> {
    if (!gerencia.value) return
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

  watch([semana, anio], fetchFlujo)
  onBeforeMount(fetchFlujo)

  return {
    flujo,
    barras,
    loading,
    gerencia,
    semana,
    anio,
    esSemanaActual,
    semanaAnterior,
    semanaSiguiente,
    fetchFlujo,
  }
}
