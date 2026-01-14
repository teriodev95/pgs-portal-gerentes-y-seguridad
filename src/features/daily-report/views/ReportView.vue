<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { useReport, useReportDialog } from '../composables'
import type { ReportType } from '../types'

// Components
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import ReportTypeSelector from '../components/ReportTypeSelector.vue'
import ReportDialog from '../components/ReportDialog.vue'

// Composables
const router = useRouter()
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

function handleBack(): void {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Reportes Diarios"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Report Type Selection -->
    <div class="p-2">
      <ReportTypeSelector
        :is-generating="isLoading"
        @report:generate="handleGenerateReport"
      />
    </div>

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
  </MainCT>
</template>