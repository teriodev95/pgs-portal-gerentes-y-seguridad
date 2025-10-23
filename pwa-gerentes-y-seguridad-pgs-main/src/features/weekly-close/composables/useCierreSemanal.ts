// composables/useCierreSemanal.ts
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCierreSemanalStore, useSignStore } from '@/features/weekly-close/stores'
import { useStore } from '@/shared/stores'
import { useCierreSemanalAPI } from './useCierreSemanalAPI'
import { useCierreSemanalCalculations } from './useCierreSemanalCalculations'
import { useWeeklyCloseErrorHandler } from './useWeeklyCloseErrorHandler'
import { transformToCreateCierre } from '../utils/weeklyCloseHelpers'
import { ROUTE_NAME } from '@/router'

export const useCierreSemanal = () => {
  const router = useRouter()
  const store = useCierreSemanalStore()
  const globalStore = useStore()
  const signStore = useSignStore()
  const calculations = useCierreSemanalCalculations()
  const { handleError } = useWeeklyCloseErrorHandler()

  // Composables especializados
  const api = useCierreSemanalAPI()

  // Datos computados principales
  const agency = computed(() => globalStore.agencyData)
  const currentDate = computed(() => globalStore.currentDate)
  const user = computed(() => globalStore.user)
  const management = computed(() => globalStore.gerenciaSelected)


  // Método principal para inicializar datos
  const initializeWeeklyClose = async () => {
    console.log('Inicializando cierre semanal...')
    if (!agency.value?.agencia || !user.value?.usuario) {
      handleError(new Error('Missing agency or user data'), 'AGENCY_USER_DATA_UNAVAILABLE')
      return
    }

    try {
      store.setLoading(true)
      console.log('loading', store.isLoading)
      store.setError(null)

      // Cargar datos en paralelo
      await loadWeeklyClose()

      // Configurar nombres para firmas
      if (store.weeklyClose) {
        signStore.nombreAgente = store.weeklyClose.resumenSemanal.agente
        signStore.nombreGerente = store.weeklyClose.resumenSemanal.gerente
        /*
        const bonusInfo = await api.getBonusInfo("Septiembre", 2025, globalStore.agencySelected as string)
        store.setBonusInfo(bonusInfo.data.bono)
        store.setWeeklyClosingBonus(bonusInfo.data.bono.montoBono)
        */
      }
    } catch (error) {
      handleError(error, 'WEEKLY_CLOSE_LOAD_FAILED')
      store.setError('Error cargando datos del cierre semanal')
    } finally {
      store.setLoading(false)
      console.log('loading', store.isLoading)
    }
  }

  // Métodos de carga individuales
  const loadWeeklyClose = async () => {
    const data = await api.getWeeklyClose(agency.value?.agencia || '')
    console.log('Cierre semanal cargado:', data)
    store.setWeeklyClose(data)
  }

  // Método para guardar el cierre

  const saveWeeklyClose = async () => {
    if (!store.weeklyClose || !management.value) {
      handleError(new Error('Incomplete data for saving'), 'INCOMPLETE_DATA_ERROR')
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
      console.log('Guardando cierre semanal:', cierreData)
      await api.createWeeklyClose(cierreData)
      await api.createCommission(globalStore.agencySelected as string)

      // Recargar datos actualizados
      await loadWeeklyClose()

      store.setClosingComplete(true)
      signStore.resetValues()

      return true
    } catch (error) {
      handleError(error, 'WEEKLY_CLOSE_SAVE_FAILED')
      store.setError('Error guardando el cierre semanal')
      return false
    } finally {
      store.setLoading(false)
    }
  }


  // Método para navegar hacia atrás
  const navigateBack = () => {
    store.resetState()
    router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
  }

  // Método para limpiar y reiniciar
  const resetWeeklyClose = () => {
    store.resetState()
    signStore.resetValues()
  }


  return {
    // Estado del store
    weeklyClose: computed(() => store.weeklyClose),
    isClosingComplete: computed(() => store.isClosingComplete),
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
    isClosingLocked: computed(() => store.isClosingLocked),
    isAgencyVacant: computed(() => store.isAgencyVacant),
    isAgencyActive: computed(() => store.isAgencyActive),
    hasRequiredData: computed(() => store.hasRequiredData),

    // Datos computados
    agency,
    currentDate,
    user,
    management,

    // Cálculos (desde el composable especializado)
    totalAgentIncome: calculations.totalAgentIncome,
    totalAgentExpenses: calculations.totalAgentExpenses,
    totalAssignmentsAmount: calculations.totalAssignmentsAmount,
    remainingCash: calculations.remainingCash,

    // Validaciones (desde el composable especializado)

    // Métodos principales
    initializeWeeklyClose,
    saveWeeklyClose,
    navigateBack,
    resetWeeklyClose,

    // Métodos de carga individual (por si se necesitan)
    loadWeeklyClose,
  }
}
