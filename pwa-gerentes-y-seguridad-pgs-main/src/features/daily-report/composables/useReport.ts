import { ref, readonly, computed } from 'vue'
import { useStore } from '@/shared/stores';
import type { ReportParams, ReportState, ReportType, ShareResult } from '../types';

// Constants
const REPORT_CONFIG = {
  API_BASE: 'https://img-reporte.xpress1.cc/api/reportes',
  API_MANAGEMENT_ENDPOINT: '/generar',
  API_AGENCY_ENDPOINT: '/agencias/generar',
  API_KEY: 'qfxS8ABtPvft0YI4PPxjvYvXOgcKeeWwUOv2LLTgDAI=',
  DEFAULT_FILE_TYPE: 'image/png',
  REQUEST_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const

export function useReport() {
  const $store = useStore()

  // Reactive state
  const state: ReportState = {
    isGenerating: ref(false),
    isSharing: ref(false),
    filename: ref(''),
    managementId: ref($store.gerenciaSelected as string || ''),
    year: ref($store.currentDate.year || new Date().getFullYear()),
    week: ref($store.currentDate.week || 1),
    error: ref(''),
    imageUrl: ref(''),
    imageBlob: ref<Blob | null>(null),
  }

  const isLoading = computed(() => state.isGenerating.value)

  const resetState = (): void => {
    state.error.value = ''
    state.imageUrl.value = ''
    state.imageBlob.value = null
  }

  const buildApiUrl = (type: ReportType): string => {
    return type === 'gerencia'
      ? REPORT_CONFIG.API_BASE + REPORT_CONFIG.API_MANAGEMENT_ENDPOINT
      : REPORT_CONFIG.API_BASE + REPORT_CONFIG.API_AGENCY_ENDPOINT
  }

  const getCurrentDayInSpanish = (): string => {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
    const today = new Date()
    return days[today.getDay()]
  }

  const createRequestPayload = (params: ReportParams) => {
    return {
      gerenciaId: params.managementId,
      semana: params.week,
      anio: params.year,
      reporteDia: getCurrentDayInSpanish(), 
    }
  }

  async function generateReport(type: ReportType) {
    console.log(`Generating ${type} report...`)

    // Use store values
    const reportParams: ReportParams = {
      managementId: $store.gerenciaSelected as string,
      year: $store.currentDate.year,
      week: $store.currentDate.week,
    }

    state.isGenerating.value = true
    resetState()

    try {
      const requestPayload = createRequestPayload(reportParams)
      const apiUrl = buildApiUrl(type)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          ...REPORT_CONFIG.REQUEST_HEADERS,
          'X-API-Key': REPORT_CONFIG.API_KEY,
        },
        body: JSON.stringify(requestPayload),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate ${type} report: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()

      if (blob.size === 0) {
        throw new Error('Received empty response from server')
      }

      state.imageBlob.value = blob
      state.imageUrl.value = URL.createObjectURL(blob)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during report generation'
      state.error.value = errorMessage
    } finally {
      state.isGenerating.value = false
    }
  }

  const generateFilename = (type: ReportType): string => {
    const typePrefix = 'reporte-diario'
    const timestamp = new Date().toISOString().split('T')[0]
    return state.filename.value ||
           `${typePrefix}-${type}-${state.managementId.value}-${state.year.value}-${state.week.value}-${timestamp}.png`
  }

  const shareNatively = async (file: File): Promise<ShareResult> => {
    try {
      await navigator.share({
        title: `Report ${state.managementId.value}`,
        text: `Report week ${state.week.value} - ${state.year.value}`,
        files: [file],
      })
      return { success: true, method: 'native' }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Native sharing failed')
    }
  }

  const downloadFile = (file: File): ShareResult => {
    try {
      const downloadLink = document.createElement('a')
      downloadLink.href = state.imageUrl.value
      downloadLink.download = file.name
      downloadLink.style.display = 'none'

      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      return { success: true, method: 'download' }
    } catch (err) {
      throw new Error('Download failed')
    }
  }

  async function shareReport(type: ReportType): Promise<ShareResult> {
    if (!state.imageBlob.value) {
      const errorMsg = 'No image available to share. Please generate a report first.'
      state.error.value = errorMsg
      return { success: false, error: errorMsg }
    }

    state.isSharing.value = true

    try {
      const filename = generateFilename(type)
      const file = new File(
        [state.imageBlob.value],
        filename,
        { type: REPORT_CONFIG.DEFAULT_FILE_TYPE }
      )

      // Try native sharing first
      if ('share' in navigator && 'canShare' in navigator && navigator.canShare({ files: [file] })) {
        return await shareNatively(file)
      } else {
        // Fallback to download
        return downloadFile(file)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share report'
      state.error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      state.isSharing.value = false
    }
  }

  /**
   * Cleans up resources and resets state
   */
  function cleanup(): void {
    if (state.imageUrl.value) {
      URL.revokeObjectURL(state.imageUrl.value)
    }
    resetState()
  }

  /**
   * Sets a custom filename for the report
   * @param name - Custom filename (without extension)
   */
  function setFilename(name: string): void {
    if (typeof name !== 'string' || name.trim() === '') {
      console.warn('Invalid filename provided')
      return
    }
    state.filename.value = name.trim()
  }

  // Return public interface
  return {
    // Readonly state
    error: readonly(state.error),
    filename: readonly(state.filename),
    imageBlob: readonly(state.imageBlob),
    imageUrl: readonly(state.imageUrl),
    isLoading,
    isGenerating: readonly(state.isGenerating),
    isSharing: readonly(state.isSharing),
    managementId: readonly(state.managementId),
    week: readonly(state.week),
    year: readonly(state.year),

    // Actions
    generateReport,
    shareReport,
    cleanup,
    setFilename,
    resetState,
  }
}