<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { ROUTE_NAME } from '@/router';
import { usePdfGenerator } from '@/features/weekly-details/composables/usePdfGenerator';
import { useStore } from '@/shared/stores';
import { useWeeklyClosingData } from '@/features/weekly-details/composables/useWeeklyClosingData';
import { useWeeklyClosingTemplate } from '@/features/weekly-details/composables/useWeeklyClosingTemplate';
import type { userPDF, IAsignacion } from '@/interfaces';

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import LoadingButton from '@/features/weekly-close/components/LoadingButton.vue';
import NavbarCT from '@/shared/components/ui/NavbarCT.vue';
import MainCT from '@/shared/components/ui/MainCT.vue';
import SectionContainer from '@/shared/components/SectionContainer.vue';
import { useRouter } from 'vue-router';

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */
const $store = useStore();
const router = useRouter();
const { tabulation, weeklyClosingDetails, generalBalance, managementNumbers, fetchWeeklyClosingDetails, fetchPdfData } = useWeeklyClosingData()
const { generateHTMLTemplate } = useWeeklyClosingTemplate()
const { generatePDF, downloadPDF } = usePdfGenerator()

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */
const isLoadingAdmin = ref(false)
const isLoadingManagement = ref(false)


/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */
/**
 * formatKey
 */


/**
 * handleGeneratePDF
 */
const handleGeneratePDF = async (user: userPDF) => {
  if (user === 'managment') {
    isLoadingManagement.value = true
  } else if (user === 'admin') {
    isLoadingAdmin.value = true
  }

  try {
    if (!$store.gerenciaSelected) return;

    await fetchPdfData({
      userID: $store.user?.usuarioId,
      managment: $store.gerenciaSelected,
      year: $store.currentDate.year,
      week: $store.currentDate.week,
    })

    if (!weeklyClosingDetails.value || !generalBalance.value || !managementNumbers.value) return;

    const htmlTemplate = generateHTMLTemplate(generalBalance.value, weeklyClosingDetails.value, managementNumbers.value, user, tabulation.value)
    const pdfUrl = await generatePDF(htmlTemplate)
    const pdfName = user === 'managment' ? 'Balance_Gerente' : 'Balance_Administración';
    downloadPDF(pdfUrl, `${pdfName}_${$store.gerenciaSelected}_${new Date().toISOString().split('T')[0]}.pdf`);
  } finally {
    isLoadingAdmin.value = false
    isLoadingManagement.value = false
  }
}

/**
 * handleBack
 */
const handleBack = () => {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}

/**
 * ------------------------------------------
 *	Lifecycle
 * ------------------------------------------
 */
onBeforeMount(async () => {
  if (!$store.gerenciaSelected) return;
  await fetchWeeklyClosingDetails();
});
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Detalles de Cierre"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Embedded Details View -->
    <iframe
      :src="`https://v0-ui-flujo-efectivo.vercel.app/detalles-cierre?gerencia=${$store.gerenciaSelected}&semana=${$store.currentDate.week}&anio=${$store.currentDate.year}`"
      class="w-full min-h-screen" frameborder="0"></iframe>


    <!-- PDF Download Section -->
    <SectionContainer>
      <div v-if="weeklyClosingDetails" class="space-y-2">
        <LoadingButton @click="handleGeneratePDF('managment')" :isLoading="isLoadingManagement"
          loadingText="Generando PDF..." text="Descargar balance para Gerentes" type="primary" />
        <LoadingButton @click="handleGeneratePDF('admin')" :isLoading="isLoadingAdmin" loadingText="Generando PDF..."
          text="Descargar balance para Administración" type="outline" />
      </div>
      <div v-else>
        <p class="text-center text-gray-400">No hay información disponible</p>
      </div>
    </SectionContainer>
  </MainCT>
</template>