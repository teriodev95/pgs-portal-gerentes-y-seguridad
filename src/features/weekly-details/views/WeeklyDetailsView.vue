<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { ROUTE_NAME } from '@/router';
import { toCurrency } from '@/shared/utils';
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
import ArrowDown from '@/shared/components/icons/ArrowDown.vue';
import ArrowUp from '@/shared/components/icons/ArrowUp.vue';
import CardContainer from '@/shared/components/CardContainer.vue';
import LoadingButton from '@/features/weekly-close/components/LoadingButton.vue';
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue';
import NavbarTop from '@/shared/components/NavbarTop.vue';
import SectionContainer from '@/shared/components/SectionContainer.vue';

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */
const $store = useStore();
const { tabulation, weeklyClosingDetails, generalBalance, managementNumbers, isLoading, fetchWeeklyClosingDetails, fetchPdfData } = useWeeklyClosingData()
const { generateHTMLTemplate } = useWeeklyClosingTemplate()
const { generatePDF, downloadPDF } = usePdfGenerator()

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */
const isLoadingAdmin = ref(false)
const isLoadingManagement = ref(false)
const sortDetailsByType = (details: IAsignacion[]) => {
  return details.sort((a, b) => {
    const typeA = a.tipo.toLowerCase();
    const typeB = b.tipo.toLowerCase();
    if (typeA < typeB) return -1;
    if (typeA > typeB) return 1;
    return 0;
  });
};

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */
/**
 * formatKey
 */
const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
};

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

  <main class="min-h-screen bg-slate-100">
    <div class="block p-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop label="Detalles de Cierre" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
      </div>
    </div>

    <!-- <LoadSkeleton v-if="isLoading" :items="6" /> -->

    <iframe
      :src="`https://v0-ui-flujo-efectivo.vercel.app/detalles-cierre?gerencia=${$store.gerenciaSelected}&semana=${$store.currentDate.week}&anio=${$store.currentDate.year}`"
      class="w-full min-h-screen" frameborder="0"></iframe>

    <article class="hidden">
      <SectionContainer v-if="weeklyClosingDetails">

        <!-- RESUMEN -->
        <CardContainer>
          <h2 class="title">Resumen</h2>

          <div class="flex justify-between gap-2">
            <p class="font-300 text-gray-400">Egresos</p>
            <p class="badget badget-danger">
              <ArrowUp class="size-4" />
              {{ toCurrency(weeklyClosingDetails.egresos.total) }}
            </p>
          </div>
          <div class="flex justify-between gap-2">
            <p class="font-300 text-gray-400">Ingresos</p>
            <p class="badget badget-success">
              <ArrowDown class="size-4" />
              {{ toCurrency(weeklyClosingDetails.ingresos.total) }}
            </p>
          </div>
          <hr class="line" />
          <div class="flex justify-between gap-2">
            <p class="font-300 text-gray-400">Efectivo a Entregar</p>
            <p class="font-md-700 text-blue-800">
              {{ toCurrency(weeklyClosingDetails.efectivoAEntregar) }}
            </p>
          </div>
        </CardContainer>
        <!-- / RESUMEN -->

        <!-- OTROS -->
        <CardContainer>
          <h2 class="title">Asignaciones</h2>

          <div class="space-y-2">

            <p class="font-300 !font-semibold text-gray-400">Detalles:</p>

            <div
              v-for="(detail, index) in sortDetailsByType(weeklyClosingDetails.ingresos.asignaciones.asignacionesList)"
              :key="index" class="flex justify-between gap-2">
              <p class="font-300 text-gray-400">
                {{ detail.tipo }}
              </p>
              <p class="font-md-700 text-blue-800">
                {{ toCurrency(detail.monto) }}
              </p>
            </div>

            <div class="flex justify-between gap-2">
              <p class="font-300 text-gray-400">Subtotal</p>
              <p class="font-md-700 text-blue-800">
                {{ toCurrency(weeklyClosingDetails.ingresos.asignaciones.subTotal) }}
              </p>
            </div>

            <hr class="line" />

            <div class="flex justify-between gap-2">
              <p class="font-300 text-gray-400">Total</p>
              <p class="badget badget-success">
                <ArrowDown class="size-4" />
                {{ toCurrency(weeklyClosingDetails.ingresos.asignaciones.total) }}
              </p>
            </div>
          </div>
        </CardContainer>

        <CardContainer>
          <h2 class="title">Cobranza</h2>

          <div class="space-y-2">
            <div v-for="[key, value] in Object.entries(weeklyClosingDetails.ingresos.cobranza)" :key="key"
              class="flex justify-between gap-2" v-show="key !== 'total'">
              <p class="font-300 text-gray-400">{{ formatKey(key) }}</p>
              <p class="font-md-700 text-blue-800">
                {{ toCurrency(value) }}
              </p>
            </div>

            <hr class="line" />

            <div class="flex justify-between gap-2">
              <p class="font-300 text-gray-400">Total</p>
              <p class="badget badget-success">
                <ArrowDown class="size-4" />
                {{ toCurrency(weeklyClosingDetails.ingresos.cobranza.total) }}
              </p>
            </div>
          </div>
        </CardContainer>

        <CardContainer>
          <h2 class="title">Asignaciones</h2>

          <div class="space-y-2">

            <p class="font-300 !font-semibold text-gray-400">Detalles:</p>

            <div
              v-for="(detail, index) in sortDetailsByType(weeklyClosingDetails.egresos.asignaciones.asignacionesList)"
              :key="index" class="flex justify-between gap-2">
              <p class="font-300 text-gray-400">
                {{ detail.tipo }}
              </p>
              <p class="font-md-700 text-blue-800">
                {{ toCurrency(detail.monto) }}
              </p>
            </div>

            <div class="flex justify-between gap-2">
              <p class="font-300 text-gray-400">Subtotal</p>
              <p class="font-md-700 text-blue-800">
                {{ toCurrency(weeklyClosingDetails.egresos.asignaciones.subTotal) }}
              </p>
            </div>

            <hr class="line" />

            <div class="flex justify-between gap-2">
              <p class="font-300 text-gray-400">Total</p>
              <p class="badget badget-danger">
                <ArrowUp class="size-4" />
                {{ toCurrency(weeklyClosingDetails.egresos.asignaciones.total) }}
              </p>
            </div>
          </div>
        </CardContainer>

        <CardContainer>
          <h2 class="title">Bonos y Comisiones</h2>

          <div class="space-y-2">
            <div v-for="[key, value] in Object.entries(weeklyClosingDetails.egresos.bonosYComisiones)" :key="key"
              class="flex justify-between gap-2"
              v-show="key !== 'total' && key !== 'totalVentas' && key !== 'detalles'">
              <p class="font-300 text-gray-400">{{ formatKey(key) }}</p>
              <p class="font-md-700 text-blue-800">
                {{ toCurrency(value) }}
              </p>
            </div>

            <hr class="line" />

            <div class="flex justify-between gap-2">
              <p class="font-300 text-gray-400">Total</p>
              <p class="badget badget-danger">
                <ArrowUp class="size-4" />
                {{ toCurrency(weeklyClosingDetails.egresos.bonosYComisiones.total) }}
              </p>
            </div>
          </div>
        </CardContainer>

        <CardContainer>
          <h2 class="title">Gastos</h2>

          <div class="space-y-2">
            <div v-for="(detail, index) in weeklyClosingDetails.egresos.gastos.gastosList" :key="index"
              class="flex justify-between gap-2">
              <p class="font-300 text-gray-400">
                {{ detail.tipo_gasto }}
              </p>
              <p class="font-md-700 text-blue-800">
                {{ toCurrency(Number(detail.monto) || 0) }}
              </p>
            </div>

            <hr class="line" />

            <div class="flex justify-between gap-2">
              <p class="font-300 text-gray-400">Total</p>
              <p class="badget badget-danger">
                <ArrowUp class="size-4" />
                {{ toCurrency(weeklyClosingDetails.egresos.gastos.total) }}
              </p>
            </div>
          </div>
        </CardContainer>
      </SectionContainer>
    </article>

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
  </main>
</template>