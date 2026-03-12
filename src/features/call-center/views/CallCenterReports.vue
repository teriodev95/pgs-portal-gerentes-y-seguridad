<script lang="ts" setup>
import { computed, onMounted } from 'vue'

// Composables
import { useCallCenter } from '@/features/call-center/composables/useCallCenter'
import { useDrawer } from '@/shared/composables'
import type { ICallCenterReport, ICallCenterSearchResult } from '@/features/call-center/types'

// Components
import BtnComponent from '@/shared/components/BtnComponent.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import ManagementCard from '@/features/call-center/components/ManagementCard.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import ReportCard from '@/features/call-center/components/ReportCard.vue'
import ReportDrawer from '@/features/call-center/components/ReportDrawer.vue'
import SearchReportInput from '@/features/call-center/components/SearchReportInput.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'

// Services, Composables and Stores initialization
const callCenter = useCallCenter()
const reportDrawer = useDrawer<ICallCenterReport>('call-center-report')

// Computed properties
const hasSummaryReports = computed(() => {
  return callCenter.summaryReportsByManagement.value?.length > 0
})

const hasReports = computed(() => {
  return callCenter.reportsByWeekAndManagement.value?.length > 0
})

// View state computed properties (used in template)
const showManagementView = computed(() => {
  return !callCenter.isLoading.value && hasSummaryReports.value && !callCenter.isManagementSelected.value
})

const showReportsView = computed(() => {
  return !callCenter.isLoading.value && hasSummaryReports.value && callCenter.isManagementSelected.value
})

const showEmptyState = computed(() => {
  return !callCenter.isLoading.value && !hasSummaryReports.value
})

// Methods
async function openReportDetails(report: ICallCenterReport | ICallCenterSearchResult): Promise<void> {
  // Si es un resultado de búsqueda desde el input
  if ('reporteId' in report) {
    // Es un ICallCenterSearchResult
    // Primero intentar buscar el reporte en los reportes ya cargados
    let fullReport = callCenter.reportsByWeekAndManagement.value.find(
      r => r.prestamoId === report.prestamoId
    )

    // Si no está en los reportes actuales, cargar la gerencia/semana/año correspondiente
    if (!fullReport) {
      await callCenter.selectWeekAndManagement(report.gerencia, report.semana, report.anio)

      // Buscar de nuevo después de cargar
      fullReport = callCenter.reportsByWeekAndManagement.value.find(
        r => r.prestamoId === report.prestamoId
      )
    }

    // Abrir el drawer con el reporte completo si se encontró
    if (fullReport) {
      callCenter.openReportDetails(fullReport)
      reportDrawer.openWith(fullReport)
    } else {
      console.error('No se pudo encontrar el reporte completo para:', report.prestamoId)
      console.error('Reportes disponibles:', callCenter.reportsByWeekAndManagement.value)
    }
  } else {
    // Es un ICallCenterReport completo - abrir directamente
    callCenter.openReportDetails(report)
    reportDrawer.openWith(report)
  }
}

async function handleSelectWeekAndManagement(gerencia: string, semana: number, anio: number): Promise<void> {
  await callCenter.selectWeekAndManagement(gerencia, semana, anio)
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await callCenter.initializeCallCenter()

    // Verificar si hay un reporte seleccionado desde navegación
    if (callCenter.selectedReport.value) {
      reportDrawer.openWith(callCenter.selectedReport.value)
    }
  } catch (error) {
    console.error('Error initializing call center reports view:', error)
  }
})
</script>

<template>
  <!-- Report Drawer -->
  <ReportDrawer />

  <!-- Main Content -->
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Reportes del Call Center"
      :show-back-button="true"
      @back="callCenter.handleBackNavigation"
    />

    <!-- Loading State -->
    <SectionContainer v-if="callCenter.isLoading.value">
      <LoadSkeleton :items="6" />
    </SectionContainer>

    <!-- Empty State: No reports available -->
    <EmptyCT
      v-else-if="showEmptyState"
      message="No hay reportes"
      description="No se encontraron reportes del call center en este momento."
    />

    <!-- Management Selection View -->
    <SectionContainer v-else-if="showManagementView">
      <!-- Filter Panel -->
      <CardContainer class="rounded-lg border bg-white p-4 space-y-4">
        <h3 class="title">Filtrar</h3>

        <!-- Filter Dropdowns -->
        <div class="grid grid-cols-2 grid-rows-2 justify-between gap-4">
          <!-- Search by Name -->
          <SearchReportInput @select-report="openReportDetails" />

          <!-- Management Filter -->
          <div class="col-span-2">
            <LabelForm for="management">
              Gerencia
            </LabelForm>
            <InputSelect v-model="callCenter.filters.value.management" id="management">
              <option value="">-- Todas --</option>
              <option v-for="management in callCenter.managements.value" :key="management" :value="management">
                {{ management }}
              </option>
            </InputSelect>
          </div>

          <!-- Year Filter -->
          <div class="w-full">
            <LabelForm for="year">
              Año
            </LabelForm>
            <InputSelect v-model="callCenter.filters.value.year" id="year">
              <option :value="0">-- Todos --</option>
              <option v-for="year in callCenter.availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </InputSelect>
          </div>

          <!-- Week Filter -->
          <div class="w-full">
            <LabelForm for="week">
              Semana
            </LabelForm>
            <InputSelect v-model="callCenter.filters.value.week" id="week">
              <option :value="0">-- Todas --</option>
              <option v-for="week in callCenter.availableWeeks" :key="week" :value="week">
                {{ week }}
              </option>
            </InputSelect>
          </div>
        </div>
      </CardContainer>

      <!-- Management Cards -->
      <ManagementCard
        :tarjetas="callCenter.filteredSummaryReports.value"
        @select-week-and-management="handleSelectWeekAndManagement"
      />
    </SectionContainer>

    <!-- Reports List View -->
    <SectionContainer v-else-if="showReportsView">
      <!-- Empty State: No reports for selected management/week -->
      <EmptyCT
        v-if="!hasReports"
        message="No hay reportes"
        description="No se encontraron reportes para la gerencia y semana seleccionadas."
      />

      <!-- Reports List -->
      <template v-else>
        <!-- Reports Count -->
        <TextCT variant="title">
          Reportes: {{ callCenter.reportsByWeekAndManagement.value.length }}
        </TextCT>

        <!-- Report Cards -->
        <ReportCard
          v-for="(report, index) in callCenter.reportsByWeekAndManagement.value"
          v-show="report"
          :key="`report-${report.prestamoId}-${index}`"
          :reporte="report"
          @selectReport="openReportDetails"
        />

        <!-- Back Button -->
        <BtnComponent full-width class="mt-6" @click="callCenter.returnToManagementList">
          Regresar
        </BtnComponent>
      </template>
    </SectionContainer>
  </MainCT>
</template>