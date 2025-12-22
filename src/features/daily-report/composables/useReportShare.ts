import { useToast } from 'vue-toast-notification'
import { useShareData } from '@/shared/composables/useShareData'
import { REPORT_CONFIG, REPORT_MESSAGES } from '../constants'
import { reportService } from '../services/report.service'
import { useReportErrorHandler } from './useReportErrorHandler'
import type { ReportParams, ReportType, ShareResult } from '../types'

export function useReportShare() {
  const $toast = useToast()
  const { handleError } = useReportErrorHandler()
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
      throw new Error('Download failed')
    }
  }

  async function shareReport(
    type: ReportType,
    params: ReportParams,
    imageBlob: Blob | null,
    imageUrl: string,
    customFilename?: string
  ): Promise<ShareResult> {
    if (!imageBlob) {
      const errorMsg = 'No image available to share. Please generate a report first.'
      handleError(new Error(errorMsg), 'REPORT_SHARE_FAILED')
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
        text: `Reporte generado`,
        files: [file],
      })

      if (shareResult.success) {
        result = shareResult as ShareResult
      } else {
        // Fallback to download
        result = downloadFile(file, imageUrl)
      }

      if (result.success) {
        $toast.success(REPORT_MESSAGES.SHARE_SUCCESS)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share report'
      handleError(err, 'REPORT_SHARE_FAILED')
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