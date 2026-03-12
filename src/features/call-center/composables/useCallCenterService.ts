import { callCenterService } from '../services/call-center.service'
import { commonService } from '@/shared/services/modules/common'
import type {
  ICallCenterReport,
  ICallCenterVisit,
} from '../types'
import { useStore } from '@/shared/stores'

/**
 * Servicio puro para manejar llamadas a API del Call Center
 * NO mantiene estado reactivo - solo hace llamadas y transforma datos
 */
export const useCallCenterService = () => {
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
  ) => {
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
    }
  }

  /**
   * Crea una nueva visita del call center
   */
  const createVisit = async (visit: ICallCenterVisit, clientName: string) => {
    try {
      const { data } = await callCenterService.createVisit(visit, clientName)
      return data
    } catch (error) {
      console.error('Error creando visita del call center:', error)
    }
  }

  /**
   * Obtiene la lista de gerencias disponibles para un usuario
   */
  const fetchManagements = async (username: string) => {
    try {
      const { data } = await commonService.getGerenciesCopy(username)
      const nombresGerencias: string[] = Object.values(data)
        .map((gerencias: any) => gerencias.map((gerencia: any) => gerencia.gerencia))
        .flat()
      return nombresGerencias
    } catch (error) {
      console.error('Error obteniendo gerencias:', error)
    }
  }

  /**
   * Obtiene el resumen de reportes agrupados por gerencia
   */
  const fetchSummaryReportsByManagement = async (userId: number) => {
    try {
      const { data } = await callCenterService.getSummaryReportsByManagement(userId)
      return data || []
    } catch (error) {
      console.error('Error obteniendo reportes por gerencia:', error)
    }
  }

  /**
   * Busca reportes por nombre de cliente o aval
   */
  const searchReportByName = async (name: string) => {
    try {
      const { data } = await callCenterService.searchReportByName(name, $store.user?.usuarioId || 0)
      return data || []
    } catch (error) {
      console.error('Error buscando reportes por nombre:', error)
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
