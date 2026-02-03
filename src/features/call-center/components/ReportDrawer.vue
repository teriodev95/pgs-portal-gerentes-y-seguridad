<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCallCenter } from '@/features/call-center/composables/useCallCenter'
import { useDrawer } from '@/shared/composables'
import type { ICallCenterReport } from '../types'

// Components
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import ReportDetailsBS from './ReportDetailsBS.vue'
import CreateVisitBS from './CreateVisitBS.vue'
import { useRevealCircleStore } from '@/shared/stores/revealCircle'

// Composables
const callCenter = useCallCenter()
const reportDrawer = useDrawer<ICallCenterReport>('call-center-report')
const revealCircleStore = useRevealCircleStore()

// Refs
const reportDetailsComponent = ref<InstanceType<typeof ReportDetailsBS>>()
const isSubmittingVisit = ref(false)

// Computed
const drawerTitle = computed(() => {
  if (callCenter.creatingVisit.value) {
    return 'Crear Visita'
  }
  return reportDrawer.selectedData.value
    ? `Reporte - ${reportDrawer.selectedData.value.prestamoId}`
    : 'Detalles del Reporte'
})

const drawerDescription = computed(() => {
  if (callCenter.creatingVisit.value) {
    return 'Registra la visita al cliente con la información solicitada'
  }
  return 'Información detallada del reporte del call center'
})

// Methods
function handleOpenChange(open: boolean) {
  if (!open) {
    reportDetailsComponent.value?.resetSheetButtonFlags()
    callCenter.cancelVisitCreation()
    // Solo limpiar el reporte después de un breve delay para permitir que las operaciones pendientes se completen
    setTimeout(() => {
      callCenter.clearSelectedReport()
      reportDrawer.reset()
    }, 100)
  }
}

function handleCloseDrawer() {
  reportDrawer.close()
}

async function handleCreateVisit(observations: string, visitStatus: string) {
  // Asegurar que el reporte está seleccionado en el composable antes de crear la visita
  if (reportDrawer.selectedData.value) {
    await callCenter.openReportDetails(reportDrawer.selectedData.value)
  }

  isSubmittingVisit.value = true
  try {
    handleCloseDrawer()
    await callCenter.createCallCenterVisit(observations, visitStatus)
    // Ocultar overlay INMEDIATAMENTE después de crear la visita
    isSubmittingVisit.value = false

    // Pequeño delay para permitir que el overlay desaparezca antes de cerrar el drawer
    await new Promise(resolve => setTimeout(resolve, 100))

    // Cerrar drawer
    revealCircleStore.showSuccess(
      'Visita registrada',
      `Se guardó con éxito la visita al cliente ${reportDrawer.selectedData.value?.nombres_cliente || ''}`
    )
  } catch (error) {
    console.error('❌ Error creating visit:', error)
    isSubmittingVisit.value = false
    // No cerrar el drawer si hay error para que el usuario vea el mensaje
  }
}

function handleCancelVisit() {
  callCenter.cancelVisitCreation()
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay de creación de visita -->
    <div
      v-if="isSubmittingVisit"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 transition-opacity"
    >
      <div class="bg-white rounded-lg shadow-lg px-8 py-6 flex flex-col items-center">
        <span class="text-lg font-semibold mb-2">Creando visita...</span>
        <span class="text-gray-500 text-sm">Por favor espera un momento</span>
        <svg class="animate-spin h-8 w-8 text-blue-500 mt-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      </div>
    </div>
  </Teleport>

  <Drawer :open="reportDrawer.isOpen.value" @update:open="handleOpenChange">
    <DrawerContent>
      <div class="mx-auto w-full max-w-lg overflow-y-auto h-full">
        <DrawerHeader>
          <DrawerTitle>{{ drawerTitle }}</DrawerTitle>
          <DrawerDescription>
            {{ drawerDescription }}
          </DrawerDescription>
        </DrawerHeader>

        <div>
          <!-- Report Details Component -->
          <ReportDetailsBS
            ref="reportDetailsComponent"
            v-if="!callCenter.creatingVisit.value && reportDrawer.selectedData.value"
            :report="reportDrawer.selectedData.value"
            @action:close-bottom-sheet="handleCloseDrawer"
            @action:create-visit="callCenter.startCreatingVisit"
          />

          <!-- Visit Creation Component -->
          <CreateVisitBS
            v-else-if="callCenter.creatingVisit.value"
            @action:cancel-visit="handleCancelVisit"
            @action:close-bottom-sheet="handleCloseDrawer"
            @action:create-visit="handleCreateVisit"
          />
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
