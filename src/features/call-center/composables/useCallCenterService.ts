import { useToast } from 'vue-toast-notification'
import { callCenterService } from '../services/call-center.service'
import { commonService } from '@/shared/services/modules/common'
import type {
  ICallCenterReport,
  ICallCenterVisit,
  ICallCenterSummaryReport,
  ICallCenterSearchResult
} from '../types'
import { useStore } from '@/shared/stores'

/**
 * Servicio puro para manejar llamadas a API del Call Center
 * NO mantiene estado reactivo - solo hace llamadas y transforma datos
 */
export const useCallCenterService = () => {
  const toast = useToast()
  const $store = useStore()

  /**
   * Transforma un reporte de camelCase (API) a snake_case (tipo ICallCenterReport)
   */
  const transformReportToSnakeCase = (apiReport: any): ICallCenterReport => {
    return {
      // Identificación
      prestamoId: apiReport.prestamoId,

      // Información del cliente (camelCase -> snake_case)
      nombres_cliente: apiReport.nombresCliente || '',
      nombres_aval: apiReport.nombresAval || '',
      nombre_atiende_cliente: apiReport.nombreAtiendeCliente || '',
      nombre_atiende_aval: apiReport.nombreAtiendeAval || '',

      // Estado de llamadas (camelCase -> snake_case)
      num_llamadas_cliente: apiReport.numLlamadasCliente || 0,
      num_llamadas_aval: apiReport.numLlamadasAval || 0,
      status_llamada_cliente: apiReport.statusLlamadaCliente || 'No contestado',
      status_llamada_aval: apiReport.statusLlamadaAval || 'No contestado',

      // URLs de llamadas (camelCase -> snake_case)
      url_llamada_cliente: apiReport.urlLlamadaCliente || '',
      url_llamada_aval: apiReport.urlLlamadaAval || '',

      // Observaciones (camelCase -> snake_case)
      observaciones_cliente: apiReport.observacionesCliente || '',
      observaciones_aval: apiReport.observacionesAval || '',

      // Preguntas y respuestas (camelCase -> snake_case)
      preguntas_cliente: apiReport.preguntasCliente || [],
      preguntas_aval: apiReport.preguntasAval || [],

      // Filtros organizacionales
      agencia: apiReport.agencia || '',
      gerencia: apiReport.gerencia || '',
      semana: apiReport.semana || 0,
      anio: apiReport.anio || 0,

      // Estado del reporte (camelCase -> snake_case)
      reportar_seguridad: apiReport.reportarSeguridad || false,
      tieneVisitas: apiReport.tieneVisitas || false
    }
  }

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

      // Transformar los reportes de camelCase a snake_case
      return (data || []).map(transformReportToSnakeCase)
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

  /**
   * Busca reportes por nombre de cliente o aval
   */
  const searchReportByName = async (name: string): Promise<ICallCenterSearchResult[]> => {
    try {
      const { data } = await callCenterService.searchReportByName(name, $store.user?.usuarioId || 0)
      return data || []
    } catch (error) {
      console.error('Error buscando reportes por nombre:', error)
      toast.error('Error al buscar reportes')
      throw new Error('No se pudieron buscar los reportes')
    }
  }

  return {
    // Solo métodos de API - sin estado reactivo
    fetchCallCenterReports,
    createVisit,
    fetchManagements,
    fetchSummaryReportsByManagement,
    searchReportByName
  }
}
