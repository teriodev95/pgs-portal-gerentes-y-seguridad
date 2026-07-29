<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

// Composables
import { useCallCenter } from '@/features/call-center/composables/useCallCenter'
import { useDrawer } from '@/shared/composables'
import { useNotification } from '@/shared/composables/useNotification'
import { useAgendaAccess, useSecurityAgenda } from '@/features/security-agenda/composables'
import {
  DEFAULT_DURATION_MINUTES,
  VISIT_ACTIVITY_TYPE
} from '@/features/security-agenda/constants'
import { nextSlot } from '@/features/security-agenda/utils/time'
import { buildVisitDetail } from '@/features/security-agenda/utils/visit'
import type { AgendaActivityDefaults } from '@/features/security-agenda/types'
import type { ICallCenterReport, ICallCenterSearchResult } from '@/features/call-center/types'

// Components
import AgendaActivityBS from '@/features/security-agenda/components/AgendaActivityBS.vue'
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
const agenda = useSecurityAgenda()
const { canUseAgenda } = useAgendaAccess()
const { showSuccess } = useNotification()

// Agendar visita: la hoja de alta de la agenda, con el reporte ya cargado
const scheduleOpen = ref(false)
const scheduleDefaults = ref<AgendaActivityDefaults | null>(null)
const scheduleHoraInicio = ref(nextSlot(DEFAULT_DURATION_MINUTES))

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

/**
 * Abre la hoja de alta de la agenda con todo puesto: tipo, lugar y cliente.
 * Al auditor sólo le queda elegir la hora. El catálogo se pide aquí, no al
 * entrar a la vista: casi nadie viene a esto.
 */
async function openScheduleVisit(report: ICallCenterReport): Promise<void> {
  // La agenda del día viaja a la hoja para que no ofrezca una duración que se
  // encime con lo ya capturado: es la misma hoja de la agenda y tiene que
  // comportarse igual desde aquí.
  await Promise.all([
    agenda.activityTypes.value.length ? null : agenda.loadCatalogs(),
    agenda.load()
  ])

  scheduleDefaults.value = {
    tipo: VISIT_ACTIVITY_TYPE,
    detalle: buildVisitDetail(
      report.nombres_cliente || report.nombres_aval,
      report.prestamoId
    ),
    gerencia: report.gerencia,
    agencia: report.agencia
  }
  scheduleHoraInicio.value = nextSlot(DEFAULT_DURATION_MINUTES)
  scheduleOpen.value = true
}

/** La visita entra a la agenda de hoy: la hoja no pregunta por el día. */
async function handleScheduleSave(payload: Parameters<typeof agenda.createActivity>[0]): Promise<void> {
  if (!(await agenda.createActivity(payload))) return

  scheduleOpen.value = false
  showSuccess('Agendamos la visita en tu agenda de hoy.')
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

  <!-- Alta de la visita en la agenda del día -->
  <AgendaActivityBS
    :open="scheduleOpen"
    :activity="null"
    :default-hora-inicio="scheduleHoraInicio"
    :activity-types="agenda.activityTypes.value"
    :scope="agenda.scope.value"
    :defaults="scheduleDefaults"
    :day-activities="agenda.activities.value"
    :saving="agenda.saving.value"
    @close="scheduleOpen = false"
    @save="handleScheduleSave"
  />

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
          :can-schedule-visit="canUseAgenda"
          @selectReport="openReportDetails"
          @scheduleVisit="openScheduleVisit"
        />

        <!-- Back Button -->
        <BtnComponent full-width class="mt-6" @click="callCenter.returnToManagementList">
          Regresar
        </BtnComponent>
      </template>
    </SectionContainer>
  </MainCT>
</template>