<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { ROUTE_NAME } from '@/router'
import { useRoute } from 'vue-router'

// Components
import NavbarTop from '@/shared/components/NavbarTop.vue'
import RevealCircle from '@/shared/components/RevealCircle.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import SettlementCard from '../components/SettlementCard.vue'
import FinancialDetails from '../components/FinancialDetails.vue'
import DiscountDetails from '../components/DiscountDetails.vue'
import SettlementProcessor from '../components/SettlementProcessor.vue'

// Composables
import { useSettlementData } from '../composables'
import { useSettlement } from '../composables/useSettlement'

// Services and route
const $route = useRoute()

// Use composables for data management
const {
  settlementData,
  isLoading,
  initializeSettlement
} = useSettlementData()

// Use composables for processing logic
const {
  isProcessing,
  isRevealCircleVisible,
  revealCircleConfig,
  paymentForm,
  processSettlement: processSettlementLogic,
  hideSuccessMessage,
  updatePaymentForm
} = useSettlement()

// Methods
async function handleProcessSettlement(): Promise<void> {
  if (!settlementData.value) return
  await processSettlementLogic(settlementData.value)
}

// Lifecycle hooks
onBeforeMount(async () => {
  await initializeSettlement()
})
</script>

<template>
  <main class="relative h-screen bg-slate-100" :class="{ 'overflow-hidden': isRevealCircleVisible }">
    <!-- Success Notification -->
    <RevealCircle
      v-show="isRevealCircleVisible"
      :type="revealCircleConfig.type"
      :main-text="revealCircleConfig.mainText"
      :secondary-text="revealCircleConfig.secondaryText"
      @action:cancel="hideSuccessMessage"
    />

    <!-- Navigation Header -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Liquidación"
        :back="{ name: ROUTE_NAME.DASHBOARD_PRESTAMO, query: { prestamo: $route.query.prestamo } }" 
        :extra-info="[
          `${settlementData?.prestamoId}`,
          `${settlementData?.cliente}`
        ]"  
      />
    </div>

    <!-- Settlement Content -->
    <div v-if="settlementData">
      <!-- Client Information -->
      <SettlementCard :settlement="settlementData" />

      <!-- Financial Details -->
      <FinancialDetails :settlement="settlementData" />

      <!-- Discount Details -->
      <DiscountDetails :settlement="settlementData" />

      <!-- Settlement Processor -->
      <div class="space-y-2 p-2">
        <SettlementProcessor 
          :is-processing="isProcessing"
          :payment-form="paymentForm"
          @update:payment-form="updatePaymentForm"
          @process:settlement="handleProcessSettlement"
        />
      </div>
    </div>

    <!-- Loading State -->
    <LoadSkeleton v-else-if="isLoading" :items="6" class="mt-4" />
  </main>
</template>