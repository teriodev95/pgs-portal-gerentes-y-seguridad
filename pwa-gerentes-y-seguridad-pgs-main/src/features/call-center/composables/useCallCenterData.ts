import { computed, ref, watch } from 'vue'
import { generateYearsArray } from '@/shared/utils'
import type { 
  ICallCenterReport, 
  ICallCenterFilters, 
  IManagementCard,
  ICallCenterStats 
} from '../types'

/**
 * Composable para manejar la lógica de filtrado y transformación de datos del Call Center
 * Separa la lógica de negocio del store y componentes
 */
export const useCallCenterData = () => {
  // Estado de datos
  const reports = ref<ICallCenterReport[]>([])
  const managements = ref<string[]>([])
  
  // Filtros
  const filters = ref<ICallCenterFilters>({
    name: '',
    management: '',
    week: 0,
    year: new Date().getFullYear()
  })

  // Estado de selección
  const selectedManagement = ref<string>('')
  const selectedWeek = ref<number>(0)
  const isManagementSelected = ref<boolean>(false)

  // Configuración
  const availableWeeks = Array.from({ length: 52 }, (_, i) => i + 1)
  const availableYears = generateYearsArray(new Date().getFullYear(), 10)

  /**
   * Filtra reportes que deben ser reportados a seguridad
   */
  const securityReports = computed(() => 
    reports.value.filter(report => report.reportar_seguridad === true)
  )

  /**
   * Filtra reportes por nombre (cliente o aval)
   */
  const reportsByName = computed(() => {
    if (!filters.value.name.trim()) return securityReports.value
    
    const searchTerm = filters.value.name.toLowerCase()
    return securityReports.value.filter(report => 
      report.nombres_cliente.toLowerCase().includes(searchTerm) ||
      report.nombres_aval.toLowerCase().includes(searchTerm)
    )
  })

  /**
   * Filtra reportes por gerencia, semana y año
   */
  const reportsByWeekAndManagement = computed(() => {
    return securityReports.value.filter(report => {
      const isWeekMatch = selectedWeek.value === 0 || report.semana === selectedWeek.value
      const isManagementMatch = selectedManagement.value === '' || report.gerencia === selectedManagement.value
      const isYearMatch = report.anio === filters.value.year
      
      return isWeekMatch && isManagementMatch && isYearMatch
    })
  })

  /**
   * Agrupa reportes por gerencia para mostrar en tarjetas
   */
  const groupedReportsByManagement = computed((): IManagementCard[] => {
    const tarjetas: Record<string, IManagementCard> = {}
    
    securityReports.value.forEach(report => {
      const isManagementMatch = !selectedManagement.value || report.gerencia === selectedManagement.value
      const isWeekMatch = !selectedWeek.value || report.semana === selectedWeek.value
      const isYearMatch = report.anio === filters.value.year

      if (isManagementMatch && isWeekMatch && isYearMatch) {
        const key = `${report.gerencia}-${report.semana}`
        
        if (!tarjetas[key]) {
          tarjetas[key] = {
            year: report.anio,
            gerency: report.gerencia,
            week: report.semana,
            reportsWhitVisit: 0,
            count: 0
          }
        }

        tarjetas[key].count++
        if (report.tieneVisitas) {
          tarjetas[key].reportsWhitVisit++
        }
      }
    })
    
    return Object.values(tarjetas)
  })

  /**
   * Calcula estadísticas de los reportes
   */
  const reportsStats = computed((): ICallCenterStats => {
    const stats: ICallCenterStats = {
      totalReports: securityReports.value.length,
      reportsWithVisits: securityReports.value.filter(r => r.tieneVisitas).length,
      reportsByManagement: {},
      reportsByWeek: {}
    }

    securityReports.value.forEach(report => {
      // Por gerencia
      stats.reportsByManagement[report.gerencia] = 
        (stats.reportsByManagement[report.gerencia] || 0) + 1
      
      // Por semana
      stats.reportsByWeek[report.semana] = 
        (stats.reportsByWeek[report.semana] || 0) + 1
    })

    return stats
  })

  /**
   * Verifica si no hay reportes
   */
  const hasNoReports = computed(() => {
    const hasNo = securityReports.value.length === 0
    console.log('🔍 hasNoReports computed:', { 
      totalReports: reports.value.length, 
      securityReports: securityReports.value.length, 
      hasNo 
    })
    return hasNo
  })

  /**
   * Obtiene reportes filtrados para búsqueda
   */
  const searchableReports = computed(() => reportsByName.value)

  /**
   * Establece los reportes
   */
  const setReports = (newReports: ICallCenterReport[]) => {
    reports.value = newReports
  }

  /**
   * Establece las gerencias
   */
  const setManagements = (newManagements: string[]) => {
    managements.value = newManagements
  }

  /**
   * Actualiza los filtros
   */
  const updateFilters = (newFilters: Partial<ICallCenterFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * Selecciona una gerencia y semana específica
   */
  const selectWeekAndManagement = (gerencia: string, semana: number) => {
    selectedManagement.value = gerencia
    selectedWeek.value = semana
    isManagementSelected.value = true
  }

  /**
   * Regresa a la vista de lista de gerencias
   */
  const returnToManagementList = () => {
    selectedManagement.value = ''
    selectedWeek.value = 0
    isManagementSelected.value = false
  }

  /**
   * Limpia todos los filtros
   */
  const clearFilters = () => {
    filters.value = {
      name: '',
      management: '',
      week: 0,
      year: new Date().getFullYear()
    }
    selectedManagement.value = ''
    selectedWeek.value = 0
    isManagementSelected.value = false
  }

  /**
   * Obtiene un reporte por ID
   */
  const getReportById = (prestamoId: string): ICallCenterReport | undefined => {
    return reports.value.find(report => report.prestamoId === prestamoId)
  }

  // Watchers para sincronización
  watch(() => filters.value.management, (newValue) => {
    selectedManagement.value = newValue
  })

  watch(() => filters.value.week, (newValue) => {
    selectedWeek.value = newValue
  })

  return {
    // Estado
    reports: computed(() => reports.value),
    managements: computed(() => managements.value),
    filters: computed(() => filters.value),
    selectedManagement: computed(() => selectedManagement.value),
    selectedWeek: computed(() => selectedWeek.value),
    isManagementSelected: computed(() => isManagementSelected.value),
    
    // Datos computados
    securityReports,
    reportsByName,
    reportsByWeekAndManagement,
    groupedReportsByManagement,
    reportsStats,
    hasNoReports,
    searchableReports,
    
    // Configuración
    availableWeeks,
    availableYears,
    
    // Métodos
    setReports,
    setManagements,
    updateFilters,
    selectWeekAndManagement,
    returnToManagementList,
    clearFilters,
    getReportById
  }
} 