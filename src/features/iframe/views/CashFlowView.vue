<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { ROUTE_NAME } from '@/router';
import { useStore } from '@/shared/stores';

// Components
import { useRouter } from 'vue-router';
import NavbarCT from '@/shared/components/ui/NavbarCT.vue';
import MainCT from '@/shared/components/ui/MainCT.vue';

// Services and stores
const $store = useStore();
const $router = useRouter();

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

function handleBack() {
  $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}

// Lifecycle hooks
onBeforeMount(async () => {
  await fetchCashFlowData();
});
</script>

<template>
  <MainCT>
    <NavbarCT
      title="Flujo de Efectivo"
      :show-back="true"
      @back="handleBack"
    />

    <iframe
      :src="`https://v0-ui-flujo-efectivo.vercel.app/?gerencia=${$store.gerenciaSelected}&semana=${$store.currentDate.week}&anio=${$store.currentDate.year}`"
      class="w-full min-h-screen" frameborder="0">
    </iframe>
  </MainCT>
</template>