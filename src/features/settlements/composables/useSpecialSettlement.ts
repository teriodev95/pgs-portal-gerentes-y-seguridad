import { ref, computed, type Ref } from 'vue'
import { settlementsService } from '../services/settlements.service'
import type { ISpecialSettlement } from '../types'

export function useSpecialSettlement() {
  const settlement: Ref<ISpecialSettlement | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedDiscountPercentage = ref<number>(0)

  // Computed properties for settlement calculations
  const balanceData = computed(() => {
    if (!settlement.value) return null

    const { monto_otorgado, cobrado, saldo, comision_total } = settlement.value

    return {
      totalInversion: monto_otorgado + comision_total,
      recuperado: cobrado,
      capitalRiesgo: saldo > 0 ? saldo : 0
    }
  })

  const liquidationOptions = computed(() => {
    if (!settlement.value) return []

    const { saldo } = settlement.value

    return [
      {
        percentage: 10,
        discount: 'DESC',
        amount: settlement.value.liquida_con_10_porciento,
        payAmount: saldo * 0.9
      },
      {
        percentage: 20,
        discount: 'DESC',
        amount: settlement.value.liquida_con_20_porciento,
        payAmount: saldo * 0.8
      },
      {
        percentage: 30,
        discount: 'DESC',
        amount: settlement.value.liquida_con_30_porciento,
        payAmount: saldo * 0.7
      },
      {
        percentage: 40,
        discount: 'DESC',
        amount: settlement.value.liquida_con_40_porciento,
        payAmount: saldo * 0.6
      },
      {
        percentage: 50,
        discount: 'DESC',
        amount: settlement.value.liquida_con_50_porciento,
        payAmount: saldo * 0.5
      }
    ]
  })

  const hasData = computed(() => settlement.value !== null)

  async function fetchSpecialSettlement(loanId: string) {
    loading.value = true
    error.value = null
    settlement.value = null

    try {
      const response = await settlementsService.getSpecialSettlement(loanId)
      console.log('Fetched special settlement:', response.data)
      settlement.value = response.data
    } catch (err) {
      console.error('Error fetching special settlement:', err)
      error.value = 'Error de conexión al obtener la liquidación especial'
    } finally {
      loading.value = false
    }
  }

  function selectLiquidationOption(percentage: number) {
    selectedDiscountPercentage.value = percentage
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('$', '$')
  }

  function formatWeekYear(week: number, year: number): string {
    return `Sem ${week} (${year})`
  }

  function clearData() {
    settlement.value = null
    error.value = null
    selectedDiscountPercentage.value = 0
  }

  return {
    // State
    settlement,
    loading,
    error,
    selectedDiscountPercentage,

    // Computed
    balanceData,
    liquidationOptions,
    hasData,

    // Methods
    fetchSpecialSettlement,
    selectLiquidationOption,
    formatCurrency,
    formatWeekYear,
    clearData
  }
}