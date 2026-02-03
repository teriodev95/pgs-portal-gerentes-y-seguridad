<script lang="ts" setup>
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { onMounted, ref, nextTick } from 'vue'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

// Composables
import { useCallCenter } from '@/features/call-center/composables/useCallCenter'

// Components
import CardContainer from '@/shared/components/CardContainer.vue'
import CreateVisitBS from '@/features/call-center/components/CreateVisitBS.vue'
import InputSearchFilter from '@/shared/components/forms/InputSearchFilter.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import ManagementCard from '@/features/call-center/components/ManagementCard.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import ReportCard from '@/features/call-center/components/ReportCard.vue'
import ReportDetailsBS from '@/features/call-center/components/ReportDetailsBS.vue'
import SearchIcon from '@/shared/components/icons/SearchIcon.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

// Services, Composables and Stores initialization
const callCenter = useCallCenter()

// State definitions
const reportBottomSheet = ref<InstanceType<typeof VueBottomSheet>>()
const reportDetailsComponent = ref<InstanceType<typeof ReportDetailsBS>>()

// Methods
function closeReportBottomSheet(): void {
  reportBottomSheet.value?.close()
}

async function openReportDetails(report: any): Promise<void> {
  callCenter.openReportDetails(report)

  await nextTick()

  if (!reportBottomSheet.value) {
    return
  }

  try {
    if (reportBottomSheet.value.isMounted) {
      reportBottomSheet.value.open()
    } else {
      await nextTick()
      reportBottomSheet.value.open()
    }
  } catch (error) {
    console.error('Error opening bottom sheet:', error)
  }
}

async function handleCreateVisit(observations: string, visitStatus: string): Promise<void> {
  try {
    closeReportBottomSheet()
    await callCenter.createCallCenterVisit(observations, visitStatus)
    console.log('Visita creada exitosamente dxed')
  } catch (error) {
    console.error('Error creating visit:', error)
  }
}

function cancelVisitCreation(): void {
  callCenter.cancelVisitCreation()
  closeReportBottomSheet()
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await callCenter.initializeCallCenter()

    // Verificar si hay un reporte seleccionado desde navegación
    if (callCenter.selectedReport.value) {
      await nextTick()

      if (reportBottomSheet.value) {
        if (reportBottomSheet.value.isMounted) {
          reportBottomSheet.value.open()
        } else {
          await nextTick()
          reportBottomSheet.value.open()
        }
      } else {
        console.warn('Bottom sheet reference is not available')
      }
    }
  } catch (error) {
    console.error('Error initializing call center reports view:', error)
  }
})
</script>

<template>
  <!-- Overlay de creación de visita -->
  <div v-if="callCenter.creatingVisit.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity">
    <div class="bg-white rounded-lg shadow-lg px-8 py-6 flex flex-col items-center">
      <span class="text-lg font-semibold mb-2">Creando visita...</span>
      <span class="text-gray-500 text-sm">Por favor espera un momento</span>
      <svg class="animate-spin h-8 w-8 text-blue-500 mt-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
    </div>
  </div>
  
  <!-- Report Details Bottom Sheet -->
  <vue-bottom-sheet ref="reportBottomSheet" :max-width="1000" @closed="reportDetailsComponent?.resetSheetButtonFlags"
    :overlay-click-close="callCenter.isOverlayClickCloseEnabled.value"
    :can-swipe="callCenter.isOverlayClickCloseEnabled.value">
    <div class="min-h-screen">
      <ReportDetailsBS ref="reportDetailsComponent"
        v-if="!callCenter.creatingVisit.value && callCenter.selectedReport.value"
        :report="callCenter.selectedReport.value" @action:close-bottom-sheet="closeReportBottomSheet"
        @action:create-visit="callCenter.startCreatingVisit" />
  
      <!-- Visit Creation Component -->
      <CreateVisitBS v-else @action:cancel-visit="callCenter.cancelVisitCreation"
        @action:close-bottom-sheet="cancelVisitCreation" @action:create-visit="handleCreateVisit" />
    </div>
    <!-- Report Details Component -->
  </vue-bottom-sheet>

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

    <!-- Empty State -->
    <EmptyCT
      v-else-if="callCenter.hasNoReports.value"
      message="No hay reportes"
      description="No se encontraron reportes del call center en este momento."
    />

    <!-- Content State -->
    <template v-else>
      <SectionContainer>
        <!-- Management Selection View -->
        <template v-if="!callCenter.isManagementSelected.value">
          <!-- Filter Panel -->
          <CardContainer class="rounded-lg border bg-white p-4 space-y-4">
            <h3 class="title">Filtrar</h3>

            <!-- Search by Name -->
            <InputSearchFilter :icon="SearchIcon" :items="callCenter.searchableReports.value"
              @selectItem="openReportDetails" item-type="reporte" id="name" label="Buscar por nombre del cliente o aval"
              placeholder="Ingresa el nombre" v-model:value="callCenter.filters.value.name" />

            <!-- Filter Dropdowns -->
            <div class="grid grid-cols-2 grid-rows-2 justify-between gap-4">
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
          <ManagementCard :tarjetas="callCenter.groupedReportsByManagement.value"
            @select-week-and-management="callCenter.selectWeekAndManagement" />
        </template>

        <!-- Reports List View -->
        <template v-else>
          <!-- Reports Count -->
          <TextCT variant="title">
            Reportes: {{ callCenter.reportsByWeekAndManagement.value.length }}
          </TextCT>

          <!-- Report Cards -->
          <ReportCard v-for="(report, index) in callCenter.reportsByWeekAndManagement.value" v-show="report"
            :key="`report-${report.prestamoId}-${index}`" :reporte="report" @selectReport="openReportDetails" />

          <!-- Back Button -->
          <BtnComponent full-width class="mt-6" @click="callCenter.returnToManagementList">
            Regresar
          </BtnComponent>
        </template>
      </SectionContainer>
    </template>
  </MainCT>
</template>