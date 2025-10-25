<script setup lang="ts">
import { ROUTE_NAME } from '@/router'
import { useReport, useReportDialog } from '../composables'
import type { ReportType } from '../types'

// Components
import NavbarTop from '@/shared/components/NavbarTop.vue'
import ReportTypeSelector from '../components/ReportTypeSelector.vue'
import ReportDialog from '../components/ReportDialog.vue'

// Composables
const { generateReport, shareReport, cleanup, isLoading, imageUrl, isSharing } = useReport()
const { isOpen, reportType, openDialog, closeDialog } = useReportDialog()

async function handleGenerateReport(type: ReportType): Promise<void> {
  try {
    openDialog(type)
    await generateReport(type)
  } catch (error) {
    console.error('Error generating report:', error)
  }
}

async function handleShareReport(): Promise<void> {
  try {
    await shareReport(reportType.value)
  } catch (error) {
    console.error('Error sharing report:', error)
  }
}

function handleDialogClose(): void {
  closeDialog()
  cleanup()
}
</script>

<template>
  <main class="min-h-screen p-2 bg-slate-100 space-y-4 pb-[6rem]">
    <!-- Navigation Header -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Reportes Diarios" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
    </div>

    <!-- Report Type Selection -->
    <ReportTypeSelector
      :is-generating="isLoading"
      @report:generate="handleGenerateReport"
    />

    <!-- Report Generation Dialog -->
    <ReportDialog
      :is-open="isOpen"
      :report-type="reportType"
      :is-loading="isLoading"
      :image-url="imageUrl"
      :is-sharing="isSharing"
      @dialog:close="handleDialogClose"
      @report:share="handleShareReport"
    />
  </main>
</template>