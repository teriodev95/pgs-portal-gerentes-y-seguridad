import { computed, ref } from 'vue'
import { loanAndPaymentService } from '../services/loan.service'
import { settlementsService } from '@/features/settlements/services/settlements.service'
import { useLoanErrorHandler } from './useLoanErrorHandler'
import { useRoute } from 'vue-router'
import { useStore } from '@/shared/stores'
import type { ILoan } from '../types'
import type { Liquidacion } from '@/features/settlements/types'

export function useLoanData() {
  const $route = useRoute()
  const $store = useStore()
  const { handleError, handleAsyncError } = useLoanErrorHandler()

  // State
  const isLoading = ref(true)
  const loanData = ref<ILoan>()
  const settlementData = ref<Liquidacion>()

  // Computed properties
  const clientFullName = computed(() => {
    if (!loanData.value) return ''
    return `${loanData.value.nombres} ${loanData.value.apellidoPaterno} ${loanData.value.apellidoMaterno}`
  })

  const avalFullName = computed(() => {
    if (!loanData.value) return ''
    return `${loanData.value.nombresAval} ${loanData.value.apellidoPaternoAval} ${loanData.value.apellidoMaternoAval}`
  })

  const weeklyPayment = computed(() => {
    if (!loanData.value) return 0
    return Math.ceil(loanData.value.saldoAlIniciarSemana - loanData.value.saldo)
  })

  const isSettlementButtonDisabled = computed(() => {
    if (!loanData.value) return true
    return parseInt(loanData.value.porcentajeCobrado.toString()) === 100
  })

  // Methods
  async function fetchLoanData(id: string) {
    $store.loading = true
    try {
      const response = await loanAndPaymentService.getLoanById(id)
      loanData.value = response.data
    } catch (error) {
      handleError(error, 'LOAN_DATA_LOAD_FAILED', { loanId: id })
    }
    $store.loading = false
  }

  async function fetchSettlementData(id: string) {
    try {
      const { data } = await settlementsService.getLiquidacion(id)
      settlementData.value = data
    } catch (error) {
      handleError(error, 'SETTLEMENT_DATA_LOAD_FAILED', { loanId: id }, false)
    }
  }

  function isWeeklyFeePaid() {
    if (!loanData.value) return false
    return weeklyPayment.value >= loanData.value.tarifa
  }

  async function initializeLoanData() {
    try {
      isLoading.value = true
      if ($route.query.prestamo) {
        const loanId = $route.query.prestamo as string
        await fetchLoanData(loanId)
        await fetchSettlementData(loanId)
      }
    } catch (error) {
      handleError(error, 'LOAN_DATA_LOAD_FAILED')
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    isLoading,
    loanData,
    settlementData,
    
    // Computed
    clientFullName,
    avalFullName,
    weeklyPayment,
    isSettlementButtonDisabled,
    
    // Methods
    fetchLoanData,
    fetchSettlementData,
    isWeeklyFeePaid,
    initializeLoanData
  }
}