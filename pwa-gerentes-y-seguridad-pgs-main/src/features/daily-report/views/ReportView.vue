<script setup lang="ts">
import { ref } from 'vue';
import { ROUTE_NAME } from '@/router'
import { useReport } from '../composables/useReport';
import type { ReportType } from '../types';

// Components
import BtnComponent from '@/shared/components/BtnComponent.vue';
import CardContainer from '@/shared/components/CardContainer.vue';
import CardTitle from '@/shared/components/ui/CardTitle.vue';
import NavbarTop from '@/shared/components/NavbarTop.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


const { generateReport, shareReport, cleanup, isLoading, imageUrl } = useReport()


const reportType = ref<ReportType>('gerencia')
const isOpenDialog = ref(false)

const handleGenerateReport = async (type: ReportType) => {
  try {
    reportType.value = type
    isOpenDialog.value = true;
    await generateReport(type)
  } catch (error) {
    console.error('Error generating or sharing report:', error)
  }
}

const handleShareReport = async () => {
  try {
    await shareReport(reportType.value)
  } catch (error) {
    console.error('Error generating or sharing report:', error)
  }
}

const handleCancel = () => {
  isOpenDialog.value = false
  cleanup()
}


</script>

<template>


  <main class="min-h-screen p-2 bg-slate-100 space-y-4 pb-[6rem]">
    <!-- Navigation Header -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Reportes Diarios" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
    </div>


    <CardContainer>
      <CardTitle title="Selecciona el tipo de reporte que deseas generar."
        subtitle="Este proceso puede tardar unos segundos. Por favor, mantén abierta esta ventana hasta que la generación del reporte haya finalizado. Luego, selecciona el grupo al que deseas enviar la imagen." />

      <div class="grid grid-cols-1 gap-2">
        <BtnComponent @click="handleGenerateReport('gerencia')">Reporte Gerencia</BtnComponent>
        <BtnComponent variant="primary" outline @click="handleGenerateReport('agencia')">Reporte Agencia</BtnComponent>
      </div>

    </CardContainer>

    <!-- Report Dialog -->
    <Dialog :open="isOpenDialog" @update:open="(value) => value ? null : (!isLoading && handleCancel())">
      <DialogContent class="rounded-lg" :class="{ 'dialog-loading': isLoading }" :disable-outside-pointer-events="isLoading">
        <DialogHeader>
          <DialogTitle>Reporte de {{ reportType }}</DialogTitle>
          <DialogDescription v-if="isLoading">
            Por favor, no cierres esta pantalla y asegúrate de tener conexión. Esta operación tomará menos de un minuto.
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-col items-center space-y-4">
          <template v-if="isLoading">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </template>

          <template v-else-if="!isLoading && imageUrl">
            <img :src="imageUrl" alt="Reporte generado" class="max-w-full h-auto">
          </template>
        </div>

        <DialogFooter v-if="!isLoading && imageUrl">
          <div class="flex flex-col gap-2 w-full">
            <BtnComponent @click="handleShareReport">Compartir Reporte</BtnComponent>
            <BtnComponent @click="handleCancel" variant="primary" outline>Cancelar</BtnComponent>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>

<style scoped>
.dialog-loading * {
  transition: opacity 0.15s ease-in-out;
}
</style>