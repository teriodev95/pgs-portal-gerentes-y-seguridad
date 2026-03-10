import { ref, readonly } from 'vue'
import { weeklyClosingService } from '../services/weekly-close.service'
import { commonService } from '@/shared/services/modules'
import { useStore } from '@/shared/stores'
import type {
  IAgencyDashboard,
  ICommissionReport,
  ICreateCierreSemana,
  IFastWeeklyClose,
  IBonusDetails,
  IUploadVideoResponse
} from '../types'

/**
 * Composable centralizado para TODAS las llamadas a la API del feature weekly-close
 *
 * RESPONSABILIDADES:
 * - Centralizar todas las llamadas al servicio
 * - Manejo de errores tipado por operación
 * - Estado de loading/error individual por operación
 * - Cero llamadas directas al servicio fuera de este composable
 */
export const useWeeklyCloseApi = () => {
  const globalStore = useStore()

  // Estado individual por operación
  const isLoadingWeeklyClose = ref(false)
  const isLoadingAgentsIncome = ref(false)
  const isLoadingBonusInfo = ref(false)
  const isLoadingCommission = ref(false)
  const isCreatingWeeklyClose = ref(false)
  const isCreatingCommission = ref(false)
  const isUploadingVideo = ref(false)

  // Errores individuales por operación
  const weeklyCloseError = ref<Error | null>(null)
  const agentsIncomeError = ref<Error | null>(null)
  const bonusInfoError = ref<Error | null>(null)
  const commissionError = ref<Error | null>(null)
  const createWeeklyCloseError = ref<Error | null>(null)
  const createCommissionError = ref<Error | null>(null)
  const uploadVideoError = ref<Error | null>(null)

  /**
   * Obtiene el cierre semanal actual de la API
   */
  const getWeeklyClose = async (agencia: string): Promise<IFastWeeklyClose> => {
    isLoadingWeeklyClose.value = true
    weeklyCloseError.value = null

    try {
      const { data } = await weeklyClosingService.getWeeklyClose(
        globalStore.currentDate.week,
        globalStore.currentDate.year,
        globalStore.gerenciaSelected as string,
        agencia
      )

      if (!data || data.length === 0) {
        throw new Error('No se encontró información del cierre semanal')
      }

      return data[0]
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Error desconocido al obtener cierre semanal')
      weeklyCloseError.value = errorMessage
      throw errorMessage
    } finally {
      isLoadingWeeklyClose.value = false
    }
  }

  /**
   * Obtiene los ingresos de agentes desde Javalin API
   */
  const getAgentsIncome = async (): Promise<IAgencyDashboard> => {
    isLoadingAgentsIncome.value = true
    agentsIncomeError.value = null

    try {
      const { data } = await weeklyClosingService.getAgentsIncome({
        agency: globalStore.agencySelected as string,
        year: globalStore.currentDate.year,
        week: globalStore.currentDate.week
      })

      if (!data) {
        throw new Error('No se encontraron datos de ingresos de agentes')
      }

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Error desconocido al obtener ingresos')
      agentsIncomeError.value = errorMessage
      throw errorMessage
    } finally {
      isLoadingAgentsIncome.value = false
    }
  }

  /**
   * Obtiene información de bonos si es semana de bonos
   */
  const getBonusInfo = async (mes: string, anio: number, agencia: string): Promise<IBonusDetails> => {
    isLoadingBonusInfo.value = true
    bonusInfoError.value = null

    try {
      const { data } = await weeklyClosingService.getBonusInfo(mes, anio, agencia)

      if (!data) {
        throw new Error('No se encontró información de bonos')
      }

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Error desconocido al obtener bonos')
      bonusInfoError.value = errorMessage
      throw errorMessage
    } finally {
      isLoadingBonusInfo.value = false
    }
  }

  /**
   * Obtiene el reporte de comisiones
   */
  const getCommission = async (): Promise<ICommissionReport> => {
    isLoadingCommission.value = true
    commissionError.value = null

    try {
      const { data } = await weeklyClosingService.getCommission({
        agency: globalStore.agencySelected as string,
        year: globalStore.currentDate.year,
        week: globalStore.currentDate.week
      })

      if (!data || !data.reporte || data.reporte.length === 0) {
        throw new Error('No se encontró información de comisiones')
      }

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Error desconocido al obtener comisiones')
      commissionError.value = errorMessage
      throw errorMessage
    } finally {
      isLoadingCommission.value = false
    }
  }

  /**
   * Crea un nuevo cierre semanal
   */
  const createWeeklyClose = async (
    cierreData: ICreateCierreSemana,
    agencyName: string,
    managementName: string,
    onClose?: () => void
  ): Promise<void> => {
    isCreatingWeeklyClose.value = true
    createWeeklyCloseError.value = null

    try {
      await weeklyClosingService.createWeeklyClose(cierreData, agencyName, managementName, onClose)
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error
        : new Error('Error desconocido al crear cierre semanal')
      createWeeklyCloseError.value = errorMessage
      throw errorMessage
    } finally {
      isCreatingWeeklyClose.value = false
    }
  }

  /**
   * Crea una comisión usando el worker
   */
  const createCommission = async (agencia: string): Promise<void> => {
    isCreatingCommission.value = true
    createCommissionError.value = null

    try {
      await commonService.createComisionWithWorker(agencia)
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error
        : new Error('Error desconocido al crear comisión')
      createCommissionError.value = errorMessage
      throw errorMessage
    } finally {
      isCreatingCommission.value = false
    }
  }

  /**
   * Sube un video de verificación
   */
  const uploadVideo = async (video: File): Promise<IUploadVideoResponse> => {
    isUploadingVideo.value = true
    uploadVideoError.value = null

    try {
      const formData = new FormData()
      formData.append('video', video)

      const { data } = await weeklyClosingService.uploadVideo(video)

      if (!data || !data.videoUrl) {
        throw new Error('La respuesta del servidor no contiene URL del video')
      }

      return data
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error
        : new Error('Error desconocido al subir video')
      uploadVideoError.value = errorMessage
      throw errorMessage
    } finally {
      isUploadingVideo.value = false
    }
  }

  /**
   * Limpia todos los estados de error
   */
  const clearErrors = () => {
    weeklyCloseError.value = null
    agentsIncomeError.value = null
    bonusInfoError.value = null
    commissionError.value = null
    createWeeklyCloseError.value = null
    createCommissionError.value = null
    uploadVideoError.value = null
  }

  /**
   * Indica si hay alguna operación en curso
   */
  const isAnyOperationLoading = () => {
    return (
      isLoadingWeeklyClose.value ||
      isLoadingAgentsIncome.value ||
      isLoadingBonusInfo.value ||
      isLoadingCommission.value ||
      isCreatingWeeklyClose.value ||
      isCreatingCommission.value ||
      isUploadingVideo.value
    )
  }

  return {
    // Métodos de API
    getWeeklyClose,
    getAgentsIncome,
    getBonusInfo,
    getCommission,
    createWeeklyClose,
    createCommission,
    uploadVideo,

    // Estados de loading (readonly para evitar mutaciones externas)
    isLoadingWeeklyClose: readonly(isLoadingWeeklyClose),
    isLoadingAgentsIncome: readonly(isLoadingAgentsIncome),
    isLoadingBonusInfo: readonly(isLoadingBonusInfo),
    isLoadingCommission: readonly(isLoadingCommission),
    isCreatingWeeklyClose: readonly(isCreatingWeeklyClose),
    isCreatingCommission: readonly(isCreatingCommission),
    isUploadingVideo: readonly(isUploadingVideo),

    // Estados de error (readonly)
    weeklyCloseError: readonly(weeklyCloseError),
    agentsIncomeError: readonly(agentsIncomeError),
    bonusInfoError: readonly(bonusInfoError),
    commissionError: readonly(commissionError),
    createWeeklyCloseError: readonly(createWeeklyCloseError),
    createCommissionError: readonly(createCommissionError),
    uploadVideoError: readonly(uploadVideoError),

    // Utilidades
    clearErrors,
    isAnyOperationLoading
  }
}
