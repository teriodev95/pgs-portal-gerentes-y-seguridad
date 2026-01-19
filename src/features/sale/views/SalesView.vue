<script setup lang="ts">
import { ref } from 'vue'
import { ROUTE_NAME } from '@/router'
import type { SaleDetails, SaleFormData } from '../types'

// Components
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import FloatBtn from '@/shared/components/FloatBtn.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import SaleBottomSheet from '@/features/sale/components/SaleBottomSheet.vue'
import SaleDetailsContent from '@/features/sale/components/SaleDetailsBottomSheetContent.vue'
import SalesList from '@/features/sale/components/SalesList.vue'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'

// Composables
import { useSaleData } from '../composables'

// Use composable for data management
const {
  sales,
  selectedSale,
  isLoadingSales,
  isSavingSale,
  isLoadingDetails,
  gerenciaSelected,
  hasSales,
  saveSale,
  selectSaleForDetails,
  clearSelectedSale
} = useSaleData()

// Component refs
const createSaleBottomSheet = ref<InstanceType<typeof SaleBottomSheet>>()
const detailsBottomSheet = ref<InstanceType<typeof VueBottomSheet>>()

// Methods
function openCreateSaleSheet(): void {
  createSaleBottomSheet.value?.open()
}

function openDetailsSheet(): void {
  detailsBottomSheet.value?.open()
}

function showSaleDetails(sale: SaleDetails): void {
  selectSaleForDetails(sale)
  setTimeout(() => {
    if (selectedSale.value) {
      openDetailsSheet()
    }
  }, 300)
}

async function handleSaveSale(saleData: SaleFormData): Promise<void> {
  try {
    await saveSale(saleData)
    createSaleBottomSheet.value?.close()
  } catch (error) {
    // Error is handled in the composable
  }
}

function handleClosedCreateSheet(): void {
  clearSelectedSale()
}

function handleClosedDetailsSheet(): void {
  clearSelectedSale()
}
</script>

<template>
  <!-- Sale Details Bottom Sheet -->
  <vue-bottom-sheet
    ref="detailsBottomSheet"
    :max-width="1000"
    :max-height="1500"
    @closed="handleClosedDetailsSheet"
  >
    <div v-if="isLoadingDetails" class="p-4 flex items-center justify-center">
      <LoadSkeleton :items="1" />
    </div>
    <SaleDetailsContent v-else :sale="selectedSale" />
  </vue-bottom-sheet>

  <!-- Create Sale Bottom Sheet -->
  <SaleBottomSheet
    ref="createSaleBottomSheet"
    :is-saving="isSavingSale"
    :gerencia-selected="gerenciaSelected"
    @submit="handleSaveSale"
    @closed="handleClosedCreateSheet"
  />

  <!-- Main Content -->
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Ventas"
      :show-back-button="true"
      @back="$router.push({ name: ROUTE_NAME.DASHBOARD_HOME })"
    />

    <!-- Sales List Component -->
    <SalesList
      :sales="sales"
      :is-loading="isLoadingSales"
      :has-sales="hasSales"
      @sale:select="showSaleDetails"
    />

    <!-- Floating Action Button -->
    <div data-dial-init class="group fixed bottom-[1.5rem] right-6 z-50">
      <FloatBtn type="primary" @click="openCreateSaleSheet" />
    </div>
  </MainCT>
</template>

<style scoped>
.bottom-sheet {
  z-index: 50;
}
</style>