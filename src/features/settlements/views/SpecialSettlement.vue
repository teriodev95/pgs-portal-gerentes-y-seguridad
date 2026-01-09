<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettlement } from '../composables/useSettlement'
import { useRevealCircleStore } from '@/shared/stores/revealCircle'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import SpecialSettlementHeader from '../components/SpecialSettlementHeader.vue'
import BalanceCard from '../components/BalanceCard.vue'
import LiquidationProposal from '../components/LiquidationProposal.vue'
import SettlementProcessor from '../components/SettlementProcessor.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'

const route = useRoute()
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

onMounted(() => {
  const loanId = route.params.id as string
  if (loanId) {
    fetchSpecialSettlement(loanId)
  }
})
</script>

<template>
  <main class="relative h-screen bg-slate-100 pb-[6rem]" :class="{ 'overflow-hidden': revealCircleStore.isVisible }">
    <!-- Navigation Header -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop
        label="Liquidación Especial"
        :back="true"
      />
    </div>

    <SectionContainer>
      <!-- Loading state -->
       <LoadSkeleton v-if="loading" :items="6"/>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>

      <!-- Settlement content -->
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

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
        <p class="text-gray-600">No se pudo cargar la información de la liquidación especial</p>
      </div>
    </SectionContainer>
  </main>
</template>