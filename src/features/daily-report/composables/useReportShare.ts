import { REPORT_CONFIG, REPORT_MESSAGES } from '../constants'
import { reportService } from '../services/report.service'
import { useNotification } from '@/shared/composables/useNotification'
import { useShareData } from '@/shared/composables/useShareData'
import type { ReportDay, ReportParams, ReportType, ShareResult } from '../types'

/**
 * Texto que acompaña la imagen en WhatsApp/Telegram. En un grupo con decenas
 * de reportes al día, "Reporte generado" no dice de quién es ni de cuándo.
 * Ej.: "Reporte Gerencia · GERD007 · jueves 03/09 · sem 36"
 */
export function buildShareCaption(type: ReportType, params: ReportParams, day?: ReportDay): string {
  const etiqueta = type === 'gerencia' ? 'Reporte Gerencia' : 'Reporte de agencias'
  const fecha = day?.date ?? new Date()
  const nombreDia = (day?.name ?? fecha.toLocaleDateString('es-MX', { weekday: 'long' })).toLowerCase()
  const dd = String(fecha.getDate()).padStart(2, '0')
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  return `${etiqueta} · ${params.managementId} · ${nombreDia} ${dd}/${mm} · sem ${params.week}`
}

export function useReportShare() {
  const { showError, showSuccess } = useNotification()
  const { shareData, isSharing } = useShareData()

  function downloadFile(file: File, imageUrl: string): ShareResult {
    try {
      const downloadLink = document.createElement('a')
      downloadLink.href = imageUrl
      downloadLink.download = file.name
      downloadLink.style.display = 'none'

      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      return { success: true, method: 'download' }
    } catch (err) {
      showError('Download failed')
      return { success: false, error: 'Download failed' }
    }
  }

  async function shareReport(
    type: ReportType,
    params: ReportParams,
    imageBlob: Blob | null,
    imageUrl: string,
    customFilename?: string,
    reportDay?: ReportDay
  ): Promise<ShareResult> {
    if (!imageBlob) {
      const errorMsg = 'No image available to share. Please generate a report first.'
      showError(errorMsg)
      return { success: false, error: errorMsg }
    }

    try {
      const filename = reportService.generateFilename(type, params, customFilename)
      const file = new File(
        [imageBlob],
        filename,
        { type: REPORT_CONFIG.DEFAULT_FILE_TYPE }
      )

      let result: ShareResult

      // Try native sharing first
      const shareResult = await shareData({
        title: `Reporte ${file.name}`,
        text: buildShareCaption(type, params, reportDay),
        files: [file],
      })

      if (shareResult.success) {
        result = shareResult as ShareResult
      } else {
        // Fallback to download
        result = downloadFile(file, imageUrl)
      }

      if (result.success) {
        showSuccess(REPORT_MESSAGES.SHARE_SUCCESS)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share report'
      showError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  return {
    // State
    isSharing,

    // Actions
    shareReport,
  }
}