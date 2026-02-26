import { ref, computed, onBeforeMount } from 'vue'
import { useStore } from '@/shared/stores/app'
import { cashFlowService } from '../services/cashFlow.service'
import { useCashFlowErrorHandler } from './useCashFlowErrorHandler'
import type { Movimiento, ResumenCashFlow } from '../types/cashFlow.types'

export function useCashFlow() {
  // 1. Services / Stores
  const $store = useStore()
  const { handleError } = useCashFlowErrorHandler()

  // 2. State
  const movimientos = ref<Movimiento[]>([])
  const resumen = ref<ResumenCashFlow>({
    total_ingresos: 0,
    total_egresos: 0,
    total_en_campo: 0,
    balance: 0,
  })
  const loading = ref(false)

  // 3. Computed
  const gerenciaSelected = computed(() => $store.gerenciaSelected)
  const currentDate = computed(() => $store.currentDate)

  const ingresos = computed(() =>
    movimientos.value.filter((m) => m.tipo_mov === 'INGRESO'),
  )

  const egresos = computed(() =>
    movimientos.value.filter((m) => m.tipo_mov === 'EGRESO'),
  )

  const enCampo = computed(() =>
    movimientos.value.filter((m) => m.tipo_mov === 'EN_CAMPO'),
  )

  // 4. Methods
  async function fetchCashFlow(): Promise<void> {
    loading.value = true
    try {
      const { data } = await cashFlowService.getMovimientos(
        gerenciaSelected.value,
        currentDate.value.year,
        currentDate.value.week,
      )

      const response = data as unknown as {
        success: boolean
        data: { movimientos: Movimiento[]; resumen: ResumenCashFlow }
      }

      if (response.success) {
        movimientos.value = response.data.movimientos
        resumen.value = response.data.resumen
      }
    } catch (error) {
      handleError(error, 'LOAD_FAILED')
    } finally {
      loading.value = false
    }
  }

  // 5. Lifecycle
  onBeforeMount(() => {
    fetchCashFlow()
  })

  // 6. Return
  return {
    resumen,
    loading,
    gerenciaSelected,
    currentDate,
    ingresos,
    egresos,
    enCampo,
    fetchCashFlow,
  }
}
