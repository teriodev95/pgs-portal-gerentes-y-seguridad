import { ref, computed, type Ref } from 'vue'
import type { ISpecialSettlement, IPayloadSpecialSettlement, IPaymentFormData } from '../types'
import { PaymentSource, RecoverySource } from '@/features/loan/types'
import { settlementsService } from '../services/settlements.service'

export function useSpecialSettlement() {
  const settlement: Ref<ISpecialSettlement | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedDiscountPercentage = ref<number>(0)
  const paymentForm = ref<IPaymentFormData>({
    amount: 0,
    paymentSource: PaymentSource.CLIENT,
    paymentRecovery: RecoverySource.AGENT,
  })

  const liquidationOptions = computed(() => {
    if (!settlement.value) return []

    const { saldo } = settlement.value

    return [
      {
        percentage: 10,
        discount: 'DESC',
        amount: settlement.value.liquida_con_10_porciento,
      },
      {
        percentage: 20,
        discount: 'DESC',
        amount: settlement.value.liquida_con_20_porciento,
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
      },
      {
        percentage: 50,
        discount: 'DESC',
        amount: settlement.value.liquida_con_50_porciento,
      }
    ]
  })

  const hasData = computed(() => settlement.value !== null)
  const canSettle = computed(() => (settlement.value && settlement.value?.semanas_transcurridas >= 52) ? true : false)

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

  async function createSpecialSettlement() {
    if(!settlement.value) return null
    const payload: IPayloadSpecialSettlement = {
      prestamo_id: settlement.value.prestamo_id,
      descuento_dinero: settlement.value.saldo - (liquidationOptions.value.find(option => option.percentage === selectedDiscountPercentage.value)?.amount || 0),
      descuento_porcentaje: selectedDiscountPercentage.value,
      liquida_con: liquidationOptions.value.find(option => option.percentage === selectedDiscountPercentage.value)?.amount || 0,
      sem_transcurridas: settlement.value.semanas_transcurridas,
      recuperado_por: '', 
      status_recuperacion: settlement.value.status_recuperacion,
      comentario: ''
    }

    console.log('Created settlement payload:', payload)
    return payload
  }


  function selectLiquidationOption(percentage: number) {
    selectedDiscountPercentage.value = percentage
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
    paymentForm,

    // Computed
    liquidationOptions,
    hasData,
    canSettle,

    // Methods
    clearData,
    createSpecialSettlement,
    fetchSpecialSettlement,
    formatWeekYear,
    selectLiquidationOption,
  }
}