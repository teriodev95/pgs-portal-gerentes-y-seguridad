<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { ROUTE_NAME } from '@/router'
import { useRoute, useRouter } from 'vue-router'
import { useRevealCircleStore } from '@/shared/stores/revealCircle'

// Components
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import SettlementCard from '../components/SettlementCard.vue'
import FinancialDetails from '../components/FinancialDetails.vue'
import DiscountDetails from '../components/DiscountDetails.vue'
import SettlementProcessor from '../components/SettlementProcessor.vue'

// Composables
import { useSettlementData } from '../composables'
import { useSettlement } from '../composables/useSettlement'
import SectionContainer from '@/shared/components/SectionContainer.vue'

// Services and route
const $route = useRoute()
const $router = useRouter()
const revealCircleStore = useRevealCircleStore()

// Use composables for data management
const {
  settlementData,
  isLoading,
  initializeSettlement
} = useSettlementData()

// Use composables for processing logic
const {
  isProcessing,
  paymentForm,
  processSettlement: processSettlementLogic,
  updatePaymentForm
} = useSettlement()

// Methods
async function handleProcessSettlement(): Promise<void> {
  if (!settlementData.value) return
  await processSettlementLogic(settlementData.value)
}

function handleBack(): void {
  $router.push({
    name: ROUTE_NAME.DASHBOARD_PRESTAMO,
    query: { prestamo: $route.query.prestamo }
  })
}

// Lifecycle hooks
onBeforeMount(async () => {
  await initializeSettlement()
})
</script>

<template>
  <MainCT :class="{ 'overflow-hidden': revealCircleStore.isVisible }">
    <!-- Top Navigation Bar -->
    <NavbarCT title="Liquidación" :subtitle="`${settlementData?.prestamoId || ''} - ${settlementData?.cliente || ''}`"
      :show-back-button="true" @back="handleBack" />

    <!-- Settlement Content -->
    <SectionContainer v-if="settlementData && !isLoading">
      <!-- Client Information -->
      <SettlementCard :settlement="settlementData" />

      <!-- Financial Details -->
      <FinancialDetails :settlement="settlementData" />

      <!-- Discount Details -->
      <DiscountDetails :settlement="settlementData" />

      <!-- Settlement Processor -->
      <SettlementProcessor :is-processing="isProcessing" :payment-form="paymentForm"
        @update:payment-form="updatePaymentForm" @process:settlement="handleProcessSettlement" />
    </SectionContainer>

    <!-- Loading State -->
    <LoadSkeleton v-else :items="6" class="mt-4" />
  </MainCT>
</template>