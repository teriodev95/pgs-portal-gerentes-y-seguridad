// composables/useCierreSemanalAPI.ts
import { weeklyClosingService } from '../services/weekly-close.service'
import { useWeeklyCloseErrorHandler } from './useWeeklyCloseErrorHandler'
import { commonService } from '@/shared/services/modules'

import type {
  ICreateCierreSemana,
  IFastWeeklyClose
} from '../types'

import { useStore } from '@/shared/stores'

/**
 * Composable para manejar todas las llamadas a la API relacionadas con el cierre semanal
 * Centraliza y abstrae las llamadas a diferentes servicios
 */
export const useCierreSemanalAPI = () => {
  const store = useStore()
  const { handleAPIError } = useWeeklyCloseErrorHandler()

  /**
   * Obtiene el cierre semanal actual
   */
  const getWeeklyClose = async (agencia: string): Promise<IFastWeeklyClose> => {
    try {
      const { data } = await weeklyClosingService.getWeeklyClose(
        store.currentDate.week,
        store.currentDate.year,
        store.gerenciaSelected as string,
        agencia
      )
      console.log('CIERRE SEMANAL FAST API', data[0])
      return data[0]
    } catch (error) {
      handleAPIError(error, 'GET')
      throw error
    }
  }

  /**
   * Crea un nuevo cierre semanal
   */
  const createWeeklyClose = async (cierreData: ICreateCierreSemana): Promise<void> => {
    try {
      await weeklyClosingService.createWeeklyClose(cierreData)
    } catch (error) {
      handleAPIError(error, 'CREATE')
      throw error
    }
  }

  /**
   * Crea una comisión con worker
  */
  const createCommission = async (agencia: string): Promise<void> => {
    try {
      await commonService.createComisionWithWorker(agencia)
    } catch (error) {
      handleAPIError(error, 'CREATE')
      throw error
    }
  }

  const getBonusInfo = async (mes: string, anio: number, agencia: string) => {
    try {
      const { data } = await weeklyClosingService.getBonusInfo(mes, anio, agencia)
      return data
    } catch (error) {
      handleAPIError(error, 'GET')
      throw error
    }
  }

  return {
    createCommission,
    createWeeklyClose,
    getBonusInfo,
    getWeeklyClose,
  }
}