import { computed, ref } from 'vue'
import { loanAndPaymentService } from '../services/loan.service'
import { settlementsService } from '@/features/settlements/services/settlements.service'
import { useLoanErrorHandler } from './useLoanErrorHandler'
import { useRoute } from 'vue-router'
import { useStore } from '@/shared/stores'
import { toCurrency } from '@/shared/utils'
import { LOAN_FIELD_LABELS, LOAN_HOUSE_NUMBER_FORMAT } from '../constants'
import type { ILoan } from '../types'
import type { Liquidacion } from '@/features/settlements/types'

export function useLoanData() {
  const $route = useRoute()
  const $store = useStore()
  const { handleError } = useLoanErrorHandler()

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

  const generalDataItems = computed(() => {
    if (!loanData.value) return []
    return [
      { label: LOAN_FIELD_LABELS.AGENT, value: loanData.value.agente },
      { label: LOAN_FIELD_LABELS.CLIENT_ID, value: loanData.value.clienteId },
      { label: LOAN_FIELD_LABELS.MANAGER, value: loanData.value.gerenteEnTurno },
      { label: LOAN_FIELD_LABELS.DELIVERY, value: toCurrency(loanData.value.montoOtorgado) }
    ]
  })

  const clientDataItems = computed(() => {
    if (!loanData.value) return []
    return [
      { label: LOAN_FIELD_LABELS.NAME, value: clientFullName.value },
      { label: LOAN_FIELD_LABELS.NEIGHBORHOOD, value: loanData.value.colonia },
      { label: LOAN_FIELD_LABELS.STREET, value: loanData.value.direccion, rightAligned: true },
      {
        label: LOAN_FIELD_LABELS.HOUSE_NUMBERS,
        value: [
          loanData.value.noExterior ? `${LOAN_HOUSE_NUMBER_FORMAT.EXTERIOR} ${loanData.value.noExterior}` : '',
          loanData.value.noInterior ? `${LOAN_HOUSE_NUMBER_FORMAT.INTERIOR} ${loanData.value.noInterior}` : ''
        ].filter(Boolean).join('  '),
        show: !!(loanData.value.noExterior || loanData.value.noInterior)
      },
      { label: LOAN_FIELD_LABELS.PHONE, value: loanData.value.telefonoCliente },
      { label: LOAN_FIELD_LABELS.LEVEL, value: loanData.value.tipoDeCliente },
      { label: LOAN_FIELD_LABELS.GRANTED, value: toCurrency(loanData.value.montoOtorgado) }
    ]
  })

  const guarantorDataItems = computed(() => {
    if (!loanData.value) return []
    return [
      { label: LOAN_FIELD_LABELS.GUARANTOR_NAME, value: avalFullName.value },
      { label: LOAN_FIELD_LABELS.GUARANTOR_NEIGHBORHOOD, value: loanData.value.coloniaAval },
      { label: LOAN_FIELD_LABELS.GUARANTOR_STREET, value: loanData.value.direccionAval, rightAligned: true },
      {
        label: LOAN_FIELD_LABELS.GUARANTOR_HOUSE_NUMBERS,
        value: [
          loanData.value.noExteriorAval ? `${LOAN_HOUSE_NUMBER_FORMAT.EXTERIOR} ${loanData.value.noExteriorAval}` : '',
          loanData.value.noInteriorAval ? `${LOAN_HOUSE_NUMBER_FORMAT.INTERIOR} ${loanData.value.noInteriorAval}` : ''
        ].filter(Boolean).join('  '),
        show: !!(loanData.value.noExteriorAval || loanData.value.noInteriorAval)
      },
      { label: LOAN_FIELD_LABELS.GUARANTOR_PHONE, value: loanData.value.telefonoAval }
    ]
  })

  const loanDataItems = computed(() => {
    if (!loanData.value) return []
    return [
      { label: LOAN_FIELD_LABELS.DELIVERY_DATE, value: `${loanData.value.semana}/${loanData.value.anio}` },
      { label: LOAN_FIELD_LABELS.LOAN_ID, value: loanData.value.prestamoId },
      { label: LOAN_FIELD_LABELS.WEEK, value: loanData.value.semana },
      { label: LOAN_FIELD_LABELS.PAYMENT_DAY, value: loanData.value.diaDePago },
      { label: LOAN_FIELD_LABELS.TERM, value: loanData.value.plazo },
      { label: LOAN_FIELD_LABELS.CHARGES, value: toCurrency(loanData.value.cargo) },
      { label: LOAN_FIELD_LABELS.TOTAL_TO_PAY, value: toCurrency(loanData.value.totalAPagar) },
      { label: LOAN_FIELD_LABELS.FIRST_PAYMENT, value: toCurrency(loanData.value.primerPago) },
      { label: LOAN_FIELD_LABELS.WEEKLY_PAYMENT, value: toCurrency(loanData.value.tarifa) },
      { label: LOAN_FIELD_LABELS.BALANCE_LOAN, value: toCurrency(loanData.value.saldo) },
      { label: LOAN_FIELD_LABELS.COLLECTED_LOAN, value: toCurrency(loanData.value.cobrado) }
    ]
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
      const data = await settlementsService.getLiquidacion(id)
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
    generalDataItems,
    clientDataItems,
    guarantorDataItems,
    loanDataItems,

    // Methods
    fetchLoanData,
    fetchSettlementData,
    isWeeklyFeePaid,
    initializeLoanData
  }
}