<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { ROUTE_NAME } from '@/router';
import { useStore } from '@/shared/stores';
import { useWeeklyClosingData } from '@/features/weekly-details/composables/useWeeklyClosingData';
import { weeklyDetailsService } from '@/features/weekly-details/services/weekly-details.service';
import type { userPDF } from '@/interfaces';
import { XPRESS_ENDPOINTS } from '@/shared/config/endpoints';

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
const { weeklyClosingDetails, fetchWeeklyClosingDetails } = useWeeklyClosingData()

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

    // El documento ya no se arma aqui. Antes esta vista generaba 848 lineas de
    // HTML y las mandaba a PDFShift —un SaaS externo, con la llave escrita en el
    // bundle— asi que el mismo cierre existia en tres versiones distintas: esta,
    // la de mox y la del libro de Excel. Ahora las tres piden el mismo PDF.
    //
    // Se pasa por Elysia y no por el servicio de reportes directo para que la
    // llave se quede en el servidor: PGS es una SPA y todo lo que toca acaba
    // siendo legible en el navegador.
    const variante = user === 'managment' ? 'gerente' : 'oficina'
    const { data } = await weeklyDetailsService.getWeeklyClosingPdf(
      $store.gerenciaSelected as string,
      $store.currentDate.year,
      $store.currentDate.week,
      variante,
    )

    const pdfName = user === 'managment' ? 'Balance_Gerente' : 'Balance_Administración';
    const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = `${pdfName}_${$store.gerenciaSelected}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      // Sin esto el blob se queda en memoria toda la sesion, y aqui se bajan
      // varios cierres seguidos.
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Error generando PDF del cierre:', error)
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
      :src="`${XPRESS_ENDPOINTS.moxUrl}/detalles-cierre/embed?gerencia=${$store.gerenciaSelected}&semana=${$store.currentDate.week}&anio=${$store.currentDate.year}`"
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
