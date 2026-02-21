import { useToast } from 'vue-toast-notification'
import { callCenterService } from '../services/call-center.service'
import { commonService } from '@/shared/services/modules/common'
import type {
  ICallCenterReport,
  ICallCenterVisit,
  ICallCenterSummaryReport
} from '../types'

/**
 * Servicio puro para manejar llamadas a API del Call Center
 * NO mantiene estado reactivo - solo hace llamadas y transforma datos
 */
export const useCallCenterService = () => {
  const toast = useToast()

  /**
   * Obtiene reportes del call center filtrados por gerencia, año y semana
   */
  const fetchCallCenterReports = async (
    managment: string,
    year: number,
    week: number
  ): Promise<ICallCenterReport[]> => {
    try {
      const { data } = await callCenterService.getCallCenterReports({
        managment,
        year,
        week
      })
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
  const createVisit = async (visit: ICallCenterVisit): Promise<string> => {
    try {
      const { data } = await callCenterService.createVisit(visit)
      return data
    } catch (error) {
      console.error('Error creando visita del call center:', error)
      toast.error('Error al registrar la visita')
      throw new Error('No se pudo registrar la visita del call center')
    }
  }

  /**
   * Obtiene la lista de gerencias disponibles para un usuario
   */
  const fetchManagements = async (username: string): Promise<string[]> => {
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
   * Obtiene el resumen de reportes agrupados por gerencia
   */
  const fetchSummaryReportsByManagement = async (userId: number): Promise<ICallCenterSummaryReport[]> => {
    try {
      const { data } = await callCenterService.getSummaryReportsByManagement(userId)
      return data || []
    } catch (error) {
      console.error('Error obteniendo reportes por gerencia:', error)
      toast.error('Error al cargar los reportes por gerencia')
      throw new Error('No se pudieron obtener los reportes por gerencia')
    }
  }

  return {
    // Solo métodos de API - sin estado reactivo
    fetchCallCenterReports,
    createVisit,
    fetchManagements,
    fetchSummaryReportsByManagement
  }
}
