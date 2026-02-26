<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { useReport, useReportDialog, useWeekDaySelector } from '../composables'
import type { ReportType } from '../types'

// Components
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import ReportTypeSelector from '../components/ReportTypeSelector.vue'
import ReportDialog from '../components/ReportDialog.vue'
import WeekDaySelector from '../components/WeekDaySelector.vue'

// Composables
const router = useRouter()
const { generateReport, shareReport, cleanup, isLoading, imageUrl, isSharing } = useReport()
const { isOpen, reportType, openDialog, closeDialog } = useReportDialog()
const { selectedDaySpanish, selectedDayKey } = useWeekDaySelector()

async function handleGenerateReport(type: ReportType): Promise<void> {
  try {
    openDialog(type)
    await generateReport(type, selectedDaySpanish.value || undefined)
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

    <div class="px-4 py-5 space-y-6">
      <!-- Week & Day Selector -->
      <WeekDaySelector />

      <!-- Callout -->
      <div class="flex gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3.5 py-3">
        <span class="text-amber-500 text-base leading-none mt-0.5">!</span>
        <p class="text-xs leading-relaxed text-amber-700/80">
          El miércoles es el primer día de la semana operativa y no genera reporte.
          Los demás días se habilitan conforme transcurren.
        </p>
      </div>

      <!-- Divider -->
      <div class="h-px bg-slate-100" />

      <!-- Report Type Selection -->
      <ReportTypeSelector
        :is-generating="isLoading"
        :is-day-selected="!!selectedDayKey"
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