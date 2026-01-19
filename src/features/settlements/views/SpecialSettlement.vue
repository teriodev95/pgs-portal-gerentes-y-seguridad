<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettlement } from '../composables/useSettlement'
import { useRevealCircleStore } from '@/shared/stores/revealCircle'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import SpecialSettlementHeader from '../components/SpecialSettlementHeader.vue'
import BalanceCard from '../components/BalanceCard.vue'
import LiquidationProposal from '../components/LiquidationProposal.vue'
import SettlementProcessor from '../components/SettlementProcessor.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'

const route = useRoute()
const router = useRouter()
const revealCircleStore = useRevealCircleStore()

const {
  // Special Settlement State
  specialSettlement: settlement,
  selectedDiscountPercentage,
  liquidationOptions,
  hasSpecialData: hasData,
  canSettle,

  // Shared State
  loading,
  error,
  isProcessing,
  paymentForm,

  // Methods
  fetchSpecialSettlement,
  processSpecialSettlement,
  selectLiquidationOption,
  updatePaymentForm,
  formatWeekYear,
} = useSettlement()

async function handleProcessSettlement() {
  await processSpecialSettlement()
}

function handleSelectOption(percentage: number) {
  selectLiquidationOption(percentage)
}

function handleBack() {
  router.back()
}

onMounted(() => {
  const loanId = route.params.id as string
  if (loanId) {
    fetchSpecialSettlement(loanId)
  }
})
</script>

<template>
  <MainCT :class="{ 'overflow-hidden': revealCircleStore.isVisible }">
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Liquidación Especial"
      :show-back-button="true"
      @back="handleBack"
    />

    <SectionContainer>
      <!-- Loading State -->
      <LoadSkeleton v-if="loading" :items="6"/>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>

      <!-- Settlement Content -->
      <div v-else-if="hasData && settlement">
        <!-- Settlement Header -->
        <SpecialSettlementHeader
          :settlement="settlement"
          :format-week-year="formatWeekYear"
        />

        <!-- Balance Card -->
        <BalanceCard :settlement="settlement" />

        <!-- Liquidation Proposal with Slots -->
        <LiquidationProposal
          :pending-balance="settlement.saldo"
          :liquidation-options="liquidationOptions"
          :selected-discount-percentage="selectedDiscountPercentage"
          @select-option="handleSelectOption"
        >
          <template #processor>
            <SettlementProcessor
              :is-processing="isProcessing"
              :payment-form="paymentForm"
              :disabled="selectedDiscountPercentage === 0 || !canSettle"
              @update:paymentForm="updatePaymentForm"
              @process:settlement="handleProcessSettlement"
            />
          </template>

          <template #alert>
            <AlertMsg
              v-if="!canSettle"
              type="danger"
              message="Este préstamo aún no cumple las 52 semanas requeridas para Liquidación especial"
            />
          </template>
        </LiquidationProposal>
      </div>

      <!-- Empty State -->
      <EmptyCT
        v-else
        message="No hay datos disponibles"
        description="No se pudo cargar la información de la liquidación especial."
      />
    </SectionContainer>
  </MainCT>
</template>