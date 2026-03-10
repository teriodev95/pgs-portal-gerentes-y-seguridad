import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCierreSemanalStore, useSignStore } from '../stores'
import { useStore, useErrorDialogStore } from '@/shared/stores'
import { useWeeklyCloseApi } from './useWeeklyCloseApi'
import { transformToCreateCierre } from '../utils/weeklyCloseHelpers'
import { ROUTE_NAME } from '@/router'

/**
 * Composable orquestador principal del feature weekly-close
 *
 * RESPONSABILIDADES:
 * - Estado global del feature (semana activa, pasos, UI flags)
 * - Orquestar el flujo completo del cierre semanal
 * - Absorbe lógica de useStepNavigation (navegación entre pasos)
 * - Absorbe lógica de useCierreSemanalCalculations (cálculos del cierre)
 * - Exponer métodos y estado que consumen componentes hijos y vista
 *
 * ABSORBE:
 * - useCierreSemanal (anterior)
 * - useStepNavigation (navegación de pasos)
 * - useCierreSemanalCalculations (cálculos)
 */
export const useWeeklyClose = () => {
  const router = useRouter()
  const store = useCierreSemanalStore()
  const globalStore = useStore()
  const signStore = useSignStore()
  const errorDialogStore = useErrorDialogStore()
  const api = useWeeklyCloseApi()

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
   */
  const totalAssignmentsAmount = computed(() => {
    return (
      store.weeklyClose?.egresosAgente.asignaciones?.reduce(
        (sum, assignment) => sum + (assignment.monto || 0),
        0
      ) || 0
    )
  })

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
      totalAssignmentsAmount.value +
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
      totalAssignmentsAmount.value
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
    totalAssignmentsAmount,
    (newValue) => {
      if (newValue && store.weeklyClose) {
        store.updateNestedField('egresosAgente', 'asignacionesNumero', newValue)
      }
    },
    { immediate: true }
  )

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
   * Carga los ingresos de agentes desde la API
   */
  const loadAgentsIncome = async (): Promise<void> => {
    const data = await api.getAgentsIncome()
    store.setAgentsIncome(data)
  }

  /**
   * Carga información de bonos si es semana de bonos
   */
  const loadBonusInfo = async (): Promise<void> => {
    if (!agency.value?.agencia || !store.weeklyClose?.isSemanaBonos.pagoBono) {
      return
    }

    const data = await api.getBonusInfo(
      'Febrero',
      currentDate.value.year,
      agency.value.agencia
    )

    if (data?.data?.bono?.montoBono) {
      //store.setBonusInfo(data.data.bono.montoBono)
    }
  }

  /**
   * Carga información de comisiones desde la API
   */
  const loadCommission = async (): Promise<void> => {
    const data = await api.getCommission()

    if (data?.reporte?.[0]) {
      //store.setCommissionInfo(data.reporte[0])
    }
  }

  /**
   * Inicializa todos los datos del cierre semanal
   */
  const initializeWeeklyClose = async (): Promise<void> => {
    if (!agency.value?.agencia || !user.value?.usuario) {
      errorDialogStore.showSimpleError(
        'Datos incompletos',
        'No se encontró información de agencia o usuario',
        'AGENCY_USER_DATA_UNAVAILABLE'
      )
      return
    }

    try {
      store.setLoading(true)
      store.setError(null)

      // Cargar datos secuencialmente para evitar problemas de dependencia
      await loadWeeklyClose()
      await loadAgentsIncome()
      await loadBonusInfo()
      await loadCommission()

      // Configurar nombres para firmas
      if (store.weeklyClose) {
        signStore.nombreAgente = store.weeklyClose.resumenSemanal.agente
        signStore.nombreGerente = store.weeklyClose.resumenSemanal.gerente
      }
    } catch (error) {
      errorDialogStore.showSimpleError(
        'Algo no salió como esperábamos',
        'Ocurrió un incidente inesperado al intentar cargar tu cierre. Intenta nuevamente o borra la caché de tu navegador para resolver el problema.',
        (error as Error).message
      )
    } finally {
      store.setLoading(false)
    }
  }

  // ============================================================================
  // MÉTODOS - Guardar cierre
  // ============================================================================

  /**
   * Guarda el cierre semanal en la API
   */
  const saveWeeklyClose = async (): Promise<boolean> => {
    if (!store.weeklyClose || !management.value) {
      errorDialogStore.showSimpleError(
        'Datos incompletos',
        'No se puede guardar el cierre sin datos completos',
        'INCOMPLETE_DATA_ERROR'
      )
      return false
    }

    try {
      store.setLoading(true)

      // Preparar datos para envío
      const cierreData = transformToCreateCierre(
        store.weeklyClose,
        management.value || '',
        signStore.uidVerificacionAgente || '',
        signStore.uidVerificacionGerente || ''
      )

      // Guardar cierre y crear comisión
      await api.createWeeklyClose(cierreData)
      await api.createCommission(globalStore.agencySelected as string)

      // Recargar datos actualizados
      await loadWeeklyClose()

      store.setClosingComplete(true)
      signStore.resetValues()

      return true
    } catch (error) {
      errorDialogStore.showSimpleError(
        '¡Ups! No pudimos guardar tu cierre semanal',
        'Ocurrió un problema al intentar guardar tu cierre semanal. Por favor, intenta nuevamente.',
        (error as Error).message
      )

      store.setError('Error guardando el cierre semanal')
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
      errorDialogStore.showSimpleError(
        'No hay cierre disponible',
        'No se puede iniciar el proceso de firma sin datos de cierre',
        'NO_WEEKLY_CLOSE_DATA'
      )
      return
    }

    router.push({ name: ROUTE_NAME.WEEKLY_CLOSE_SIGN })
  }

  /**
   * Navega a la vista de corrección
   */
  const navigateToCorrection = (): void => {
    if (!weeklyClose.value) return

    const bonuses = weeklyClose.value.egresosGerente.bonosPagadosEnSemana
    const collectionCommission = weeklyClose.value.egresosGerente.comisionCobranzaPagadaEnSemana
    const salesCommission = weeklyClose.value.egresosGerente.comisionVentasPagadaEnSemana

    const amountsString = `${bonuses},${collectionCommission},${salesCommission}`

    router.push({
      name: ROUTE_NAME.RECORD_CORRECTION,
      params: {
        type: 'cierre',
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
    signStore.resetValues()
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
    totalAssignmentsAmount,
    remainingCash,
    cashDelivered,
    totalCommissionsToPay,
    finalBalance,

    // Métodos de carga
    initializeWeeklyClose,
    loadWeeklyClose,
    loadAgentsIncome,
    loadBonusInfo,
    loadCommission,

    // Métodos de guardado
    saveWeeklyClose,

    // Métodos de navegación
    navigateBack,
    navigateToSign,
    navigateToCorrection,
    resetWeeklyClose
  }
}
