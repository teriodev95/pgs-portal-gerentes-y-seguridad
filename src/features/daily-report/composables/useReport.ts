import { ref, readonly, computed } from 'vue'
import { useStore } from '@/shared/stores'
import { reportService } from '../services/report.service'
import { useReportShare } from './useReportShare'
import { REPORT_MESSAGES } from '../constants'
import type { ReportParams, ReportType } from '../types'
import { useNotification } from '@/shared/composables/useNotification'

export function useReport() {
  const $store = useStore()
  const { shareReport: shareReportService, isSharing } = useReportShare()
  const { showSuccess } = useNotification()


  // Reactive state
  const isGenerating = ref(false)
  const filename = ref('')
  const error = ref('')
  const imageUrl = ref('')
  const imageBlob = ref<Blob | null>(null)

  // Computed properties
  const isLoading = computed(() => isGenerating.value)
  const managementId = computed(() => $store.gerenciaSelected as string || '')
  const year = computed(() => $store.currentDate.year || new Date().getFullYear())
  const week = computed(() => $store.currentDate.week || 1)

  // Current report params
  const currentReportParams = computed((): ReportParams => ({
    managementId: managementId.value,
    year: year.value,
    week: week.value,
  }))

  function resetState(): void {
    error.value = ''
    imageUrl.value = ''
    imageBlob.value = null
  }

  async function generateReport(type: ReportType, dayName?: string): Promise<void> {
    console.log(`Generating ${type} report...`)

    isGenerating.value = true
    resetState()

    try {
      const blob = await reportService.generateReport(type, currentReportParams.value, dayName)

      imageBlob.value = blob
      imageUrl.value = URL.createObjectURL(blob)

      showSuccess(REPORT_MESSAGES.GENERATION_SUCCESS)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during report generation'
      error.value = errorMessage
      console.error('Report generation error:', err)
    } finally {
      isGenerating.value = false
    }
  }

  async function shareReport(type: ReportType): Promise<void> {
    try {
      await shareReportService(
        type,
        currentReportParams.value,
        imageBlob.value,
        imageUrl.value,
        filename.value || undefined
      )
    } catch (err) {
      console.error('Report sharing error:', err)
    }
  }

  function cleanup(): void {
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
    }
    resetState()
  }

  function setFilename(name: string): void {
    if (typeof name !== 'string' || name.trim() === '') {
      console.warn('Invalid filename provided')
      return
    }
    filename.value = name.trim()
  }

  // Return public interface
  return {
    // Readonly state
    error: readonly(error),
    filename: readonly(filename),
    imageBlob: readonly(imageBlob),
    imageUrl: readonly(imageUrl),
    isLoading,
    isGenerating: readonly(isGenerating),
    isSharing: readonly(isSharing),
    managementId: readonly(managementId),
    week: readonly(week),
    year: readonly(year),

    // Actions
    generateReport,
    shareReport,
    cleanup,
    setFilename,
    resetState,
  }
}