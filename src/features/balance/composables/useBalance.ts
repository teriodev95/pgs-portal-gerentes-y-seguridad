import { onBeforeMount, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { balanceService } from '../services/balance.service'
import type { IBalance } from '../types'

// Interface para los items del balance
interface BalanceItem {
  label: string
  value: keyof IBalance
}

// Estado inicial del balance
const initialBalance: IBalance = {
  ingresosPorAsignaciones: 0,
  ingresosPorPrimerosPagos: 0,
  ingresosPorCierres: 0,
  ingresosPorIncidentesYReposiciones: 0,

  egresosPorAsignaciones: 0,
  egresosPorVentas: 0,
  egresosPorComisionDeCobranza: 0,
  egresosPorComisionDeVentas: 0,
  egresosPorGastos: 0,
  egresosPorIncidentesYReposiciones: 0,

  totalIngresos: 0,
  totalEgresos: 0,
  balance: 0
}

export function useBalance() {
  // Services, Composables and Stores initialization
  const $store = useStore()

  // State definitions
  const isLoading = ref(false)
  const balance = ref<IBalance>(initialBalance)

  // Configuración de items para ingresos y egresos
  const incomeItems: BalanceItem[] = [
    { label: 'INGRESOS POR ASIGNACIONES', value: 'ingresosPorAsignaciones' },
    { label: 'INGRESOS POR PRIMEROS PAGOS', value: 'ingresosPorPrimerosPagos' },
    { label: 'INGRESOS POR CIERRES', value: 'ingresosPorCierres' },
    { label: 'INGRESOS POR INCIDENTES Y REPOSICIONES', value: 'ingresosPorIncidentesYReposiciones' }
  ]

  const expenseItems: BalanceItem[] = [
    { label: 'EGRESOS POR ASIGNACIONES', value: 'egresosPorAsignaciones' },
    { label: 'EGRESOS POR VENTAS', value: 'egresosPorVentas' },
    { label: 'EGRESOS POR COMISIÓN DE COBRANZA', value: 'egresosPorComisionDeCobranza' },
    { label: 'EGRESOS POR COMISIÓN DE VENTAS', value: 'egresosPorComisionDeVentas' },
    { label: 'EGRESOS POR GASTOS', value: 'egresosPorGastos' },
    { label: 'EGRESOS POR INCIDENTES Y REPOSICIONES', value: 'egresosPorIncidentesYReposiciones' }
  ]

  // Methods
  async function fetchBalance(): Promise<void> {
    if (!$store.user?.usuarioId || !$store.gerenciaSelected) {
      console.error('Missing required data for balance fetch')
      return
    }

    try {
      isLoading.value = true

      const response = await balanceService.getBalance(
        $store.user.usuarioId,
        $store.gerenciaSelected,
        $store.currentDate.year,
        $store.currentDate.week
      )

      balance.value = response.data
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Lifecycle hooks
  onBeforeMount(async () => {
    await fetchBalance()
  })

  return {
    // State
    isLoading,
    balance,
    
    // Configuration
    incomeItems,
    expenseItems,
    
    // Methods
    fetchBalance
  }
}
