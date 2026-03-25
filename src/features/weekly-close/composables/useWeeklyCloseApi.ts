import { ref, readonly } from 'vue'
import { weeklyClosingService } from '../services/weekly-close.service'
import { commonService } from '@/shared/services/modules'
import { useStore } from '@/shared/stores'
import type {
  IUploadVideoResponse,
  IWeeklyCloseWithIncome
} from '../types'
import type { CreateNewWeeklyClose } from '../types/new-weekly.types'

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
  const isCreatingWeeklyClose = ref(false)
  const isCreatingCommission = ref(false)
  const isUploadingVideo = ref(false)

  // Errores individuales por operación
  const weeklyCloseError = ref<Error | null>(null)
  const createWeeklyCloseError = ref<Error | null>(null)
  const createCommissionError = ref<Error | null>(null)
  const uploadVideoError = ref<Error | null>(null)

  /**
   * Obtiene el cierre semanal actual de la API
   */
  const getWeeklyClose = async (agencia: string): Promise<IWeeklyCloseWithIncome> => {
    isLoadingWeeklyClose.value = true
    weeklyCloseError.value = null

    try {
      const { data } = await weeklyClosingService.getWeeklyClose({
        agency: agencia,
        year: globalStore.currentDate.year,
        week: globalStore.currentDate.week
      })

      if (!data) {
        throw new Error('No se encontró información del cierre semanal')
      }

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Error desconocido al obtener cierre semanal')
      weeklyCloseError.value = errorMessage
      throw errorMessage
    } finally {
      isLoadingWeeklyClose.value = false
    }
  }

  /**
   * Crea un nuevo cierre semanal (API nueva - Elysia)
   */
  const createNewWeeklyClose = async (
    cierreData: CreateNewWeeklyClose,
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
      isCreatingWeeklyClose.value ||
      isCreatingCommission.value ||
      isUploadingVideo.value
    )
  }

  return {
    // Métodos de API
    getWeeklyClose,
    createNewWeeklyClose,
    uploadVideo,

    // Estados de loading (readonly para evitar mutaciones externas)
    isLoadingWeeklyClose: readonly(isLoadingWeeklyClose),
    isCreatingWeeklyClose: readonly(isCreatingWeeklyClose),
    isCreatingCommission: readonly(isCreatingCommission),
    isUploadingVideo: readonly(isUploadingVideo),

    // Estados de error (readonly)
    weeklyCloseError: readonly(weeklyCloseError),
    createWeeklyCloseError: readonly(createWeeklyCloseError),
    createCommissionError: readonly(createCommissionError),
    uploadVideoError: readonly(uploadVideoError),

    // Utilidades
    clearErrors,
    isAnyOperationLoading
  }
}
