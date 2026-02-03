import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { useCallCenterStore } from '@/features/call-center/stores/call-center'
import useGeolocation from '@/shared/composables/useGeolocation'
import type { ICallCenterReport, ICallCenterVisit } from '../types'
import type { ItemSearchFilter } from '@/shared/composables/useItemRenderer'

// Composables especializados
import { useCallCenterAPI } from './useCallCenterAPI'
import { useCallCenterData } from './useCallCenterData'
import { useCallCenterUI } from './useCallCenterUI'

/**
 * Composable principal para la funcionalidad Call Center
 * Orquesta todos los composables especializados y proporciona una API unificada
 */
export const useCallCenter = () => {
  const router = useRouter()
  const store = useStore()
  const callCenterStore = useCallCenterStore()
  const { userLocation, hasPermission } = useGeolocation()

  // Composables especializados
  const api = useCallCenterAPI()
  const data = useCallCenterData()
  const ui = useCallCenterUI()

  // Datos computados del store global
  const user = computed(() => store.user)
  const username = computed(() => store.user?.usuario || '')
  const userId = computed(() => store.user?.usuarioId || 0)
  const currentDate = computed(() => store.currentDate)

  /**
   * Inicializa todos los datos del Call Center
   */
  const initializeCallCenter = async () => {
    if (!username.value) {
      ui.setError('Usuario no disponible')
      return
    }

    try {
      ui.setLoading(true)
      ui.clearError()

      // Cargar datos en paralelo
      await Promise.all([
        loadCallCenterReports(),
        loadManagements()
      ])

      // Manejar navegación activa hacia préstamo si es necesario
      handleActiveGoToLoan()

      // Restaurar reporte seleccionado desde el store si existe
      if (callCenterStore.selectedReport) {
        const report = JSON.parse(JSON.stringify(callCenterStore.selectedReport))
        ui.selectReport(report)
      }
    } catch (error) {
      console.error('Error inicializando Call Center:', error)
      ui.setError('Error cargando datos del Call Center')
    } finally {
      ui.setLoading(false)
      ui.clearLoanValues()
    }
  }

  /**
   * Carga los reportes del Call Center
   */
  const loadCallCenterReports = async () => {
    try {
      const reports = await api.getCallCenterReports(username.value)
      data.setReports(reports)
    } catch (error) {
      console.error('Error cargando reportes:', error)
      throw error
    }
  }

  /**
   * Carga las gerencias disponibles
   */
  const loadManagements = async () => {
    try {
      const managements = await api.getManagements(username.value)
      data.setManagements(managements)
    } catch (error) {
      console.error('Error cargando gerencias:', error)
      throw error
    }
  }

  /**
   * Maneja la navegación activa hacia un préstamo
   */
  const handleActiveGoToLoan = async () => {
    if (callCenterStore.activeGoToLoan && callCenterStore.loanID) {
      // Desactivar la navegación activa
      callCenterStore.setActiveGoToLoan(false, '')
      
      // Buscar el reporte por ID
      const report = data.getReportById(callCenterStore.loanID)
      if (report) {
        ui.selectReport(report)
        callCenterStore.setSelectedReport(report)
      }
    }
  }

  /**
   * Crea una nueva visita del Call Center
   */
  const createCallCenterVisit = async (observaciones: string, statusVisit: string) => {
    if (!hasPermission.value) {
      throw new Error('No se tienen permisos de ubicación. No se puede crear la visita.')
    }

    if (!userLocation.value) {
      throw new Error('No se ha podido obtener la ubicación del usuario')
    }

    if (!ui.selectedReport.value) {
      throw new Error('No hay un reporte seleccionado')
    }

    try {
      const visit: ICallCenterVisit = {
        log: {
          creada_por: userId.value,
          observaciones,
          status: statusVisit
        },
        lat: userLocation.value.lat,
        lng: userLocation.value.lng,
        prestamoId: ui.selectedReport.value.prestamoId
      }

      console.log('Creando visita con datos:', visit, typeof visit )

      await api.createCallCenterVisit(visit)
      ui.finishVisitCreation()
      
      // Recargar reportes para actualizar el estado
      await loadCallCenterReports()
    } catch (error) {
      console.error('Error creando visita:', error)
      throw error
    }
  }

  /**
   * Abre los detalles de un reporte
   */
  const openReportDetails = async (report: ICallCenterReport | ItemSearchFilter) => {
    const callCenterReport = report as ICallCenterReport
    ui.selectReport(callCenterReport)
    
    // Guardar en el store para persistencia
    callCenterStore.setSelectedReport(callCenterReport)
    
    // La lógica de abrir el bottom sheet se maneja en el componente
  }

  /**
   * Maneja la navegación hacia atrás
   */
  const handleBackNavigation = () => {
    if (data.isManagementSelected.value) {
      data.returnToManagementList()
    } else {
      router.back()
    }
  }

  /**
   * Selecciona una gerencia y semana
   */
  const selectWeekAndManagement = (gerencia: string, semana: number) => {
    data.selectWeekAndManagement(gerencia, semana)
    window.scrollTo({ top: 0 })
  }

  /**
   * Regresa a la lista de gerencias
   */
  const returnToManagementList = () => {
    data.returnToManagementList()
  }

  /**
   * Inicia la creación de una visita
   */
  const startCreatingVisit = () => {
    ui.startCreatingVisit()
  }

  /**
   * Cancela la creación de una visita
   */
  const cancelVisitCreation = () => {
    ui.cancelVisitCreation()
  }

  /**
   * Cierra el bottom sheet y cancela la visita
   */
  const closeBottomSheetAndCancelVisit = () => {
    ui.cancelVisitCreation()
  }

  /**
   * Reinicia todo el estado
   */
  const resetCallCenter = () => {
    data.clearFilters()
    ui.resetUIState()
    callCenterStore.resetState()
  }

  /**
   * Limpia el reporte seleccionado
   */
  const clearSelectedReport = () => {
    ui.clearSelectedReport()
    callCenterStore.setSelectedReport(null)
  }

  /**
   * Clona un reporte para hacerlo mutable
   */
  const cloneReport = (report: any): ICallCenterReport | null => {
    if (!report) return null
    return JSON.parse(JSON.stringify(report))
  }

  return {
    // Estado del store global
    user,
    username,
    userId,
    currentDate,
    userLocation,
    hasPermission,

    // Estado de datos (desde useCallCenterData)
    reports: data.reports,
    managements: data.managements,
    filters: data.filters,
    selectedManagement: data.selectedManagement,
    selectedWeek: data.selectedWeek,
    isManagementSelected: data.isManagementSelected,
    
    // Datos computados (desde useCallCenterData)
    securityReports: data.securityReports,
    reportsByName: data.reportsByName,
    reportsByWeekAndManagement: data.reportsByWeekAndManagement,
    groupedReportsByManagement: data.groupedReportsByManagement,
    reportsStats: data.reportsStats,
    hasNoReports: data.hasNoReports,
    searchableReports: data.searchableReports,
    
    // Configuración (desde useCallCenterData)
    availableWeeks: data.availableWeeks,
    availableYears: data.availableYears,

    // Estado de UI (desde useCallCenterUI)
    isLoading: ui.isLoading,
    error: ui.error,
    creatingVisit: ui.creatingVisit,
    isOverlayClickCloseEnabled: ui.isOverlayClickCloseEnabled,
    selectedReport: computed(() => cloneReport(ui.selectedReport.value || callCenterStore.selectedReport)),
    activeGoToLoan: ui.activeGoToLoan,
    loanID: ui.loanID,

    // Métodos principales
    initializeCallCenter,
    createCallCenterVisit,
    openReportDetails,
    handleBackNavigation,
    selectWeekAndManagement,
    returnToManagementList,
    startCreatingVisit,
    cancelVisitCreation,
    closeBottomSheetAndCancelVisit,
    resetCallCenter,
    clearSelectedReport,

    // Métodos de datos
    setReports: data.setReports,
    setManagements: data.setManagements,
    updateFilters: data.updateFilters,
    getReportById: data.getReportById,

    // Métodos de UI
    setLoading: ui.setLoading,
    setError: ui.setError,
    clearError: ui.clearError,
    selectReport: ui.selectReport,
    activateGoToLoan: ui.activateGoToLoan,
    clearLoanValues: ui.clearLoanValues
  }
} 