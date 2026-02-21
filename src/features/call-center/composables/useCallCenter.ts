import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import useGeolocation from '@/shared/composables/useGeolocation'
import { generateYearsArray } from '@/shared/utils'
import type {
  ICallCenterReport,
  ICallCenterVisit,
  ICallCenterFilters,
  ICallCenterSummaryReport
} from '../types'
import type { ItemSearchFilter } from '@/shared/composables/useItemRenderer'

// Servicio puro de API
import { useCallCenterService } from './useCallCenterService'

/**
 * Composable principal para la funcionalidad Call Center
 * Maneja TODA la reactividad: datos, UI y lógica de negocio
 */
export const useCallCenter = () => {
  const router = useRouter()
  const store = useStore()
  const { userLocation, hasPermission } = useGeolocation()

  // Servicio puro de API (sin estado)
  const service = useCallCenterService()

  // ===================================
  // Estado de DATOS (movido desde service)
  // ===================================
  const managements = ref<string[]>([])
  const summaryReportsByManagement = ref<ICallCenterSummaryReport[]>([])
  const reports = ref<ICallCenterReport[]>([])

  // Filtros
  const filters = ref<ICallCenterFilters>({
    name: '',
    management: '',
    week: 0,
    year: new Date().getFullYear()
  })

  // Estado de selección de gerencia
  const selectedManagement = ref<string>('')
  const selectedWeek = ref<number>(0)
  const selectedYear = ref<number>(new Date().getFullYear())
  const isManagementSelected = ref<boolean>(false)

  // Configuración
  const availableWeeks = Array.from({ length: 52 }, (_, i) => i + 1)
  const availableYears = generateYearsArray(new Date().getFullYear(), 10)

  // ===================================
  // Estado de UI 
  // ===================================
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const creatingVisit = ref<boolean>(false)

  // Estado de selección
  const selectedReport = ref<ICallCenterReport | null>(null)

  // ===================================
  // Datos computados del store global
  // ===================================
  const username = computed(() => store.user?.usuario || '')
  const userId = computed(() => store.user?.usuarioId || 0)

  // ===================================
  // Computeds de DATOS
  // ===================================
  const reportsByWeekAndManagement = computed(() => reports.value)

  /**
   * Filtra los reportes resumen por gerencia según los filtros activos
   */
  const filteredSummaryReports = computed(() => {
    let filtered = summaryReportsByManagement.value
    if (filters.value.management) filtered = filtered.filter(report => report.gerencia === filters.value.management)
    if (filters.value.year && filters.value.year !== 0) filtered = filtered.filter(report => report.anio === filters.value.year)
    if (filters.value.week && filters.value.week !== 0) filtered = filtered.filter(report => report.semana === filters.value.week)

    return filtered
  })

  // ===================================
  // Métodos de UI
  // ===================================
  const cancelVisitCreation = () => {
    creatingVisit.value = false
  }

  const clearSelectedReport = () => {
    selectedReport.value = null
  }

  const finishVisitCreation = () => {
    creatingVisit.value = false
  }

  const selectReport = (report: ICallCenterReport) => {
    selectedReport.value = report
  }

  const startCreatingVisit = () => {
    creatingVisit.value = true
  }

  // ===================================
  // Métodos de manejo de DATOS
  // ===================================
  const setReports = (newReports: ICallCenterReport[]) => {
    reports.value = newReports
  }

  const setSummaryReportsByManagement = (newSummary: ICallCenterSummaryReport[]) => {
    summaryReportsByManagement.value = newSummary
  }

  const setManagements = (newManagements: string[]) => {
    managements.value = newManagements
  }

  const selectWeekAndManagementState = (gerencia: string, semana: number, anio: number) => {
    selectedManagement.value = gerencia
    selectedWeek.value = semana
    selectedYear.value = anio
    isManagementSelected.value = true
  }

  const returnToManagementListState = () => {
    selectedManagement.value = ''
    selectedWeek.value = 0
    selectedYear.value = new Date().getFullYear()
    isManagementSelected.value = false
    reports.value = []
  }

  // ===================================
  // Métodos de carga de datos
  // ===================================

  /**
   * Carga resumen de reportes por gerencia
   */
  const loadSummaryReportsByManagement = async () => {
    try {
      const summaryReports = await service.fetchSummaryReportsByManagement(userId.value)
      setSummaryReportsByManagement(summaryReports)
    } catch (error) {
      console.error('Error cargando reportes resumen por gerencia:', error)
      throw error
    }
  }

  /**
   * Carga las gerencias disponibles
   */
  const loadManagements = async () => {
    try {
      const managementsData = await service.fetchManagements(username.value)
      setManagements(managementsData)
    } catch (error) {
      console.error('Error cargando gerencias:', error)
      throw error
    }
  }

  // ===================================
  // Métodos principales
  // ===================================

  /**
   * Inicializa todos los datos del Call Center
   * Solo carga gerencias y resumen - los reportes se cargan al seleccionar una tarjeta
   */
  const initializeCallCenter = async () => {
    if (!username.value) {
      error.value = 'Usuario no disponible'
      return
    }

    try {
      isLoading.value = true
      error.value = null

      // Cargar solo gerencias y resumen de reportes
      await Promise.all([
        loadManagements(),
        loadSummaryReportsByManagement()
      ])
    } catch (err) {
      console.error('Error inicializando Call Center:', err)
      error.value = 'Error cargando datos del Call Center'
    } finally {
      isLoading.value = false
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

    if (!selectedReport.value) {
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
        prestamoId: selectedReport.value.prestamoId
      }

      console.log('Creando visita con datos:', visit, typeof visit)

      await service.createVisit(visit)
      finishVisitCreation()

      // Recargar reportes para actualizar el estado
      // await loadCallCenterReports()
    } catch (error) {
      console.error('Error creando visita:', error)
      throw error
    }
  }

  /**
   * Abre los detalles de un reporte
   */
  const openReportDetails = async (report: ICallCenterReport) => {
    const callCenterReport = report
    selectReport(callCenterReport)
  }

  /**
   * Maneja la navegación hacia atrás
   */
  const handleBackNavigation = () => {
    if (isManagementSelected.value) {
      returnToManagementList()
    } else {
      router.back()
    }
  }

  /**
   * Selecciona una gerencia, semana y año
   * Carga los reportes específicos para esa selección
   */
  const selectWeekAndManagement = async (gerencia: string, semana: number, anio: number) => {
    try {
      isLoading.value = true
      error.value = null

      // Actualizar el estado de selección
      selectWeekAndManagementState(gerencia, semana, anio)

      // Cargar reportes filtrados por gerencia, año y semana
      const reportsData = await service.fetchCallCenterReports(gerencia, anio, semana)
      setReports(reportsData)

      console.log('Reportes cargados para gerencia:', { gerencia, semana, anio, count: reportsData.length })

      window.scrollTo({ top: 0 })
    } catch (err) {
      console.error('Error cargando reportes de gerencia:', err)
      error.value = 'Error cargando reportes de la gerencia'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Regresa a la lista de gerencias
   */
  const returnToManagementList = () => {
    returnToManagementListState()
  }

  /**
   * Clona un reporte para hacerlo mutable
   */
  const cloneReport = (report: any): ICallCenterReport | null => {
    if (!report) return null
    return JSON.parse(JSON.stringify(report))
  }

  // ===================================
  // API pública del composable
  // ===================================
  return {
    // Estado de datos
    filters: computed(() => filters.value),
    isManagementSelected: computed(() => isManagementSelected.value),
    managements: computed(() => managements.value),

    // Datos computados
    reportsByWeekAndManagement,
    summaryReportsByManagement: computed(() => summaryReportsByManagement.value),
    filteredSummaryReports,

    // Configuración
    availableWeeks,
    availableYears,

    // Estado de UI
    creatingVisit: computed(() => creatingVisit.value),
    isLoading: computed(() => isLoading.value),
    selectedReport: computed(() => cloneReport(selectedReport.value)),

    // Métodos principales
    cancelVisitCreation,
    clearSelectedReport,
    createCallCenterVisit,
    handleBackNavigation,
    initializeCallCenter,
    openReportDetails,
    returnToManagementList,
    selectWeekAndManagement,
    startCreatingVisit
  }
}
