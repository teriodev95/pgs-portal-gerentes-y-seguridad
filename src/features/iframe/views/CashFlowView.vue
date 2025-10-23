<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { ROUTE_NAME } from '@/router';
import { useStore } from '@/shared/stores';

// Components
import NavbarTop from '@/shared/components/NavbarTop.vue'

// Services and stores
const $store = useStore();

// State
const isLoading = ref(false);

// Methods
async function fetchCashFlowData() {
  try {
    isLoading.value = true;
  } catch (error) {
    console.error('Error fetching cash flow data:', error);
  } finally {
    isLoading.value = false;
  }
}

// Lifecycle hooks
onBeforeMount(async () => {
  await fetchCashFlowData();
});
</script>

<template>
  <main class="h-screen bg-slate-100">
    <div class="block p-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop label="Flujo de Efectivo" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
      </div>
    </div>

    <iframe
      :src="`https://v0-ui-flujo-efectivo.vercel.app/?gerencia=${$store.gerenciaSelected}&semana=${$store.currentDate.week}&anio=${$store.currentDate.year}`"
      class="w-full min-h-screen" frameborder="0">
    </iframe>
  </main>
</template>