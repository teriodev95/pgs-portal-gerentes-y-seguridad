import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCierreSemanalStore, useSignStore } from '../stores'
import { useStore } from '@/shared/stores'
import { useWeeklyCloseApi } from './useWeeklyCloseApi'
import { transformToNewCreateCierre } from '../utils/weeklyCloseHelpers'
import { ROUTE_NAME } from '@/router'
import { useNotification } from '@/shared/composables/useNotification'
import { unsignedVideoUsers } from '../constants'

export const useWeeklyClose = () => {
  const router = useRouter()
  const store = useCierreSemanalStore()
  const globalStore = useStore()
  const signStore = useSignStore()
  const api = useWeeklyCloseApi()
  const { showError } = useNotification()


  // ============================================================================
  // COMPUTED - Datos del contexto global
  // ============================================================================
  const agency = computed(() => globalStore.agencyData)
  const currentDate = computed(() => globalStore.currentDate)
  const user = computed(() => globalStore.user)
  const management = computed(() => globalStore.gerenciaSelected)
  const weeklyClose = computed(() => store.weeklyClose)

  // ============================================================================
  // COMPUTED - Estados del cierre
  // ============================================================================
  const isClosingComplete = computed(() => store.isClosingComplete)
  const isLoading = computed(() => store.isLoading || api.isAnyOperationLoading())
  const error = computed(() => store.error)
  const isClosingLocked = computed(() => store.isClosingLocked)
  const isAgencyVacant = computed(() => store.isAgencyVacant)
  const isAgencyActive = computed(() => store.isAgencyActive)
  const hasRequiredData = computed(() => store.hasRequiredData)

  // ============================================================================
  // CÁLCULOS DEL CIERRE (absorbe useCierreSemanalCalculations)
  // ============================================================================

  /**
   * Calcula el total de montos de asignaciones
  const totalAssignmentsAmount = computed(() => {
    return (
      store.weeklyClose?.egresosAgente.asignaciones?.reduce(
        (sum, assignment) => sum + (assignment.monto || 0),
        0
      ) || 0
    )
  })
   */

  /**
   * Calcula el total de ingresos del agente
   */
  const totalAgentIncome = computed(() => {
    if (!store.weeklyClose) return 0

    const { ingresosAgente } = store.weeklyClose

    return (
      (ingresosAgente.cobranzaPura || 0) +
      (ingresosAgente.montoExcedente || 0) +
      (ingresosAgente.liquidaciones || 0) +
      (ingresosAgente.multas || 0) +
      (ingresosAgente.otrosIngresos || 0)
    )
  })

  /**
   * Calcula el total de egresos del agente
   */
  const totalAgentExpenses = computed(() => {
    if (!store.weeklyClose) return 0

    return (
      store.weeklyClose.egresosAgente.asignaciones || 0 +
      (store.weeklyClose.egresosAgente.otrosEgresos || 0) +
      (store.weeklyClose.egresosAgente.efectivoEntregadoCierre || 0)
    )
  })

  /**
   * Calcula el efectivo restante después del cierre
   */
  const remainingCash = computed(() => {
    if (!store.weeklyClose) return 0

    const { egresosAgente, egresosGerente } = store.weeklyClose
    const totalCommissions =
      (egresosGerente.comisionCobranzaPagadaEnSemana || 0) +
      (egresosGerente.comisionVentasPagadaEnSemana || 0) +
      (egresosGerente.bonosPagadosEnSemana || 0)

    return (egresosAgente.efectivoEntregadoCierre || 0) - totalCommissions
  })

  /**
   * Calcula el efectivo entregado en el cierre
   */
  const cashDelivered = computed(() => {
    if (!store.weeklyClose) return 0

    return (
      totalAgentIncome.value -
      (store.weeklyClose.egresosAgente.otrosEgresos || 0) -
      (store.weeklyClose.egresosAgente.asignaciones || 0)
    )
  })

  /**
   * Calcula el total de comisiones a pagar
   */
  const totalCommissionsToPay = computed(() => {
    if (!store.weeklyClose) return 0

    const { egresosGerente } = store.weeklyClose
    return (
      (egresosGerente.comisionCobranzaPagadaEnSemana || 0) +
      (egresosGerente.comisionVentasPagadaEnSemana || 0) +
      (egresosGerente.bonosPagadosEnSemana || 0)
    )
  })

  /**
   * Calcula el balance final (ingresos - egresos)
   */
  const finalBalance = computed(() => {
    return totalAgentIncome.value - totalAgentExpenses.value
  })

  // ============================================================================
  // WATCHERS - Sincronización automática con el store
  // ============================================================================
  watch(
    totalAgentExpenses,
    (newValue) => {
      if (store.weeklyClose) {
        store.updateNestedField('egresosAgente', 'totalEgresosAgente', newValue)
      }
    },
    { immediate: true }
  )

  watch(
    remainingCash,
    (newValue) => {
      if (store.weeklyClose) {
        store.updateNestedField('egresosGerente', 'efectivoRestanteCierre', newValue)
      }
    },
    { immediate: true }
  )

  watch(
    cashDelivered,
    (newValue) => {
      if (store.weeklyClose) {
        store.updateNestedField('egresosAgente', 'efectivoEntregadoCierre', newValue)
      }
    },
    { immediate: true }
  )

  // ============================================================================
  // MÉTODOS - Carga de datos
  // ============================================================================

  /**
   * Carga el cierre semanal desde la API
   */
  const loadWeeklyClose = async (): Promise<void> => {
    if (!agency.value?.agencia) {
      throw new Error('No hay agencia seleccionada')
    }

    const data = await api.getWeeklyClose(agency.value.agencia)
    store.setWeeklyClose(data)
  }


  /**
   * Inicializa todos los datos del cierre semanal
   */
  const initializeWeeklyClose = async (): Promise<void> => {
    if (!agency.value?.agencia || !user.value?.usuario) {
     showError('Datos incompletos, no se puede cargar el cierre semanal sin agencia y usuario seleccionados')
      return
    }

    try {
      store.setLoading(true)
      store.setError(null)

      // Cargar datos secuencialmente para evitar problemas de dependencia
      await loadWeeklyClose()

      // Configurar nombres para firmas
      if (store.weeklyClose) {
        signStore.agentName = store.weeklyClose.resumenSemanal.agente
        signStore.managerName = store.weeklyClose.resumenSemanal.gerente
      }

      if(unsignedVideoUsers.includes(user.value.usuario)){
        signStore.canCloseWithoutSigning = true
      }
    } catch (error) {
      console.error('Error inicializando el cierre semanal:', error)
    } finally {
      store.setLoading(false)
    }
  }

  // ============================================================================
  // MÉTODOS - Guardar cierre
  // ============================================================================

  /**
   * Guarda el cierre semanal en la API usando la nueva API de Elysia
   */
  const saveWeeklyClose = async (onSuccess?: () => void): Promise<boolean> => {
    if (!store.weeklyClose || !management.value) {
      showError('Datos incompletos, no se puede guardar el cierre semanal sin información completa')
      return false
    }

    try {
      store.setLoading(true)

      // Preparar datos para envío usando la nueva transformación
      const cierreData = transformToNewCreateCierre(
        store.weeklyClose,
        signStore.agentVerificationVideoUrl || '',
        signStore.managerVerificationVideoUrl || '',
        '' // observaciones - vacío por defecto
      )

      // Guardar cierre usando la nueva API de Elysia y crear comisión
      await api.createNewWeeklyClose(
        cierreData,
        agency.value?.agencia || '',
        management.value || '',
        onSuccess
      )
      await api.createCommission(globalStore.agencySelected as string)

      // Recargar datos actualizados
      await loadWeeklyClose()

      store.setClosingComplete(true)
      signStore.reset()

      return true
    } catch (error) {
      console.error('Error guardando el cierre semanal:', error)
      return false
    } finally {
      store.setLoading(false)
    }
  }

  // ============================================================================
  // MÉTODOS - Navegación
  // ============================================================================

  /**
   * Navega hacia atrás (dashboard)
   */
  const navigateBack = (): void => {
    store.resetState()
    router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
  }

  /**
   * Navega a la vista de firma
   */
  const navigateToSign = (): void => {
    if (!weeklyClose.value) {
      showError('No hay cierre disponible, no se puede iniciar el proceso de firma sin datos de cierre')
      return
    }

    router.push({ name: ROUTE_NAME.WEEKLY_CLOSE_SIGN })
  }

  /**
   * Navega a la vista de corrección
   */
  const navigateToCorrection = (): void => {
    if (!weeklyClose.value) {
      showError('No hay cierre disponible, no se puede iniciar el proceso de corrección sin datos de cierre')
      return
    }

    const bonuses = weeklyClose.value.egresosGerente.bonosPagadosEnSemana
    const collectionCommission = weeklyClose.value.egresosGerente.comisionCobranzaPagadaEnSemana
    const salesCommission = weeklyClose.value.egresosGerente.comisionVentasPagadaEnSemana

    const amountsString = `${bonuses},${collectionCommission},${salesCommission}`

    router.push({
      name: ROUTE_NAME.RECORD_CORRECTION,
      params: {
        type: 'cierre_v2',
        id: weeklyClose.value.id.toString(),
        amount: amountsString
      }
    })
  }

  /**
   * Reinicia el estado del cierre semanal
   */
  const resetWeeklyClose = (): void => {
    store.resetState()
    signStore.reset()
  }

  // ============================================================================
  // RETURN - API pública del composable
  // ============================================================================
  return {
    // Estado del cierre
    weeklyClose,
    isClosingComplete,
    isLoading,
    error,
    isClosingLocked,
    isAgencyVacant,
    isAgencyActive,
    hasRequiredData,

    // Datos del contexto
    agency,
    currentDate,
    user,
    management,

    // Cálculos del cierre
    totalAgentIncome,
    totalAgentExpenses,
    remainingCash,
    cashDelivered,
    totalCommissionsToPay,
    finalBalance,

    // Métodos de carga
    initializeWeeklyClose,
    loadWeeklyClose,

    // Métodos de guardado
    saveWeeklyClose,

    // Métodos de navegación
    navigateBack,
    navigateToSign,
    navigateToCorrection,
    resetWeeklyClose
  }
}
