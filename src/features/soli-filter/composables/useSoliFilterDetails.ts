import { ref } from 'vue'
import { soliFilterService } from '../services/soliFilter.service'
import type { TablaCargosItemMcp } from '../types/soliFilter.types'

interface DocumentoInvalidoError {
  causa: string
  solucion: string
  doc: string
}

interface ResubirResult {
  success: boolean
  error?: DocumentoInvalidoError
}

export function useSoliFilterDetails() {
  const isUploading = ref(false)
  const uploadingDocKey = ref<string | null>(null)
  const tablaCargosData = ref<TablaCargosItemMcp | null>(null)
  const isLoadingTablaCargos = ref(false)

  async function resubirDocumento(
    solicitudId: number,
    docKey: string,
    file: File,
  ): Promise<ResubirResult> {
    isUploading.value = true
    uploadingDocKey.value = docKey

    try {
      await soliFilterService.resubirDocumento(solicitudId, docKey, file)
      return { success: true }
    } catch (error: any) {
      // Check if it's a validation error from the API
      if (error?.response?.data?.code === 'DOCUMENTO_INVALIDO' && error?.response?.data?.data) {
        const errorData = error.response.data.data
        return {
          success: false,
          error: {
            causa: errorData.causa || 'Error desconocido',
            solucion: errorData.solucion || 'Intente nuevamente',
            doc: errorData.doc || docKey,
          },
        }
      }

      // For other errors, return a generic error
      return {
        success: false,
        error: {
          causa: 'Error al subir el documento',
          solucion: 'Verifique su conexión e intente nuevamente',
          doc: docKey,
        },
      }
    } finally {
      isUploading.value = false
      uploadingDocKey.value = null
    }
  }

  async function fetchTablaCargos(tablaCargosId: number): Promise<void> {
    isLoadingTablaCargos.value = true
    tablaCargosData.value = null

    try {
      const response = await soliFilterService.obtenerCargosDesdeMCP(tablaCargosId)
      console.log('MCP Response:', response)
      if (response.data?.rows && Array.isArray(response.data.rows) && response.data.rows.length > 0) {
        tablaCargosData.value = response.data.rows[0]
      }
    } catch (error) {
      console.error('Error fetching tabla cargos:', error)
      tablaCargosData.value = null
    } finally {
      isLoadingTablaCargos.value = false
    }
  }

  return {
    isUploading,
    uploadingDocKey,
    tablaCargosData,
    isLoadingTablaCargos,
    resubirDocumento,
    fetchTablaCargos,
  }
}
