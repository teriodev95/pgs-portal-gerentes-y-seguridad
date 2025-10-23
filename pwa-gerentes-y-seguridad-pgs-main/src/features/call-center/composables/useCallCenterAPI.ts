import { callCenterService } from '../services/call-center.service'
import { commonService } from '@/shared/services/modules/common'
import { useToast } from 'vue-toast-notification'
import type {
  ICallCenterReport,
  ICallCenterVisit,
} from '../types'

/**
 * Composable para manejar todas las llamadas a la API relacionadas con Call Center
 * Centraliza y abstrae las llamadas a diferentes servicios
 */
export const useCallCenterAPI = () => {
  const toast = useToast()

  /**
   * Obtiene los reportes del call center por usuario de seguridad
   */
  const getCallCenterReports = async (username: string): Promise<ICallCenterReport[]> => {
    try {
      const { data } = await callCenterService.getReportesCallCenterBySeguridad(username)
      return data || []
    } catch (error) {
      console.error('Error obteniendo reportes del call center:', error)
      toast.error('Error al cargar los reportes del call center')
      throw new Error('No se pudieron obtener los reportes del call center')
    }
  }

  /**
   * Crea una nueva visita del call center
   */
  const createCallCenterVisit = async (visit: ICallCenterVisit): Promise<string> => {
    try {
      const { data } = await callCenterService.createVisitaCallCenter(visit)
      return data
    } catch (error) {
      console.error('Error creando visita del call center:', error)
      toast.error('Error al registrar la visita')
      throw new Error('No se pudo registrar la visita del call center')
    }
  }

  /**
   * Obtiene las gerencias disponibles para el usuario
   */
  const getManagements = async (username: string): Promise<string[]> => {
    try {
      const { data } = await commonService.getGerenciesCopy(username)
      const nombresGerencias: string[] = Object.values(data)
        .map((gerencias: any) => gerencias.map((gerencia: any) => gerencia.gerencia))
        .flat()
      return nombresGerencias
    } catch (error) {
      console.error('Error obteniendo gerencias:', error)
      toast.error('Error al cargar las gerencias')
      throw new Error('No se pudieron obtener las gerencias')
    }
  }

  /**
   * Obtiene estadísticas de reportes por gerencia
   */
  const getReportsStats = async (username: string): Promise<Record<string, number>> => {
    try {
      const reports = await getCallCenterReports(username)
      const stats: Record<string, number> = {}
      
      reports.forEach(report => {
        if (report.reportar_seguridad) {
          stats[report.gerencia] = (stats[report.gerencia] || 0) + 1
        }
      })
      
      return stats
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return {}
    }
  }

  /**
   * Valida si un reporte existe
   */
  const validateReportExists = async (prestamoId: string, username: string): Promise<boolean> => {
    try {
      const reports = await getCallCenterReports(username)
      return reports.some(report => report.prestamoId === prestamoId)
    } catch (error) {
      console.error('Error validando reporte:', error)
      return false
    }
  }

  return {
    getCallCenterReports,
    createCallCenterVisit,
    getManagements,
    getReportsStats,
    validateReportExists
  }
} 