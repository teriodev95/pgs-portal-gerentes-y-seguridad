import { ref } from 'vue'
import type { ReportType } from '../types'

export function useReportDialog() {
  const isOpen = ref(false)
  const reportType = ref<ReportType>('gerencia')

  function openDialog(type: ReportType): void {
    reportType.value = type
    isOpen.value = true
  }

  function closeDialog(): void {
    isOpen.value = false
  }

  function handleDialogClose(): void {
    if (!isOpen.value) return
    closeDialog()
  }

  return {
    // State
    isOpen,
    reportType,

    // Actions
    openDialog,
    closeDialog,
    handleDialogClose,
  }
}