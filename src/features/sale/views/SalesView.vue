<script setup lang="ts">
import { ROUTE_NAME } from '@/router'
import { useRouter } from 'vue-router'
import type { SaleDetails } from '../types'
import { useDrawer } from '@/shared/composables'
import { useSaleStore } from '../stores'

// Components
import FloatBtn from '@/shared/components/FloatBtn.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import SaleDrawer from '@/features/sale/components/SaleDrawer.vue'
import SalesList from '@/features/sale/components/SalesList.vue'

// Composables
import { useSaleData } from '../composables'

const router = useRouter()

// Stores & Composables
const saleStore = useSaleStore()
const saleDrawer = useDrawer<SaleDetails>('sale')

// Inicializar lógica de negocio (fetch inicial en onBeforeMount)
useSaleData()

// Methods
function handleSaleSelect(sale: SaleDetails): void {
  saleDrawer.openWith(sale)
}

function handleBack(): void {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <!-- Sale Drawer (Create & Details) -->
  <SaleDrawer />

  <!-- Main Content -->
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Ventas"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Sales List Component -->
    <SalesList
      :sales="saleStore.sales"
      :is-loading="saleStore.isLoadingSales"
      :has-sales="saleStore.hasSales"
      @sale:select="handleSaleSelect"
    />

    <!-- Floating Action Button -->
    <div data-dial-init class="group fixed bottom-[1.5rem] right-6 z-50">
      <FloatBtn type="primary" @click="saleDrawer.open()" />
    </div>
  </MainCT>
</template>