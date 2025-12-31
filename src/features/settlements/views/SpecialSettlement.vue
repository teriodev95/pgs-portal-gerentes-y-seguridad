<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { useSpecialSettlement } from '../composables'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import SpecialSettlementHeader from '../components/SpecialSettlementHeader.vue'
import BalanceCard from '../components/BalanceCard.vue'
import LiquidationProposal from '../components/LiquidationProposal.vue'

const route = useRoute()

const {
  // State
  settlement,
  loading,
  error,
  selectedDiscountPercentage,

  // Computed
  balanceData,
  liquidationOptions,
  hasData,

  // Methods
  fetchSpecialSettlement,
  selectLiquidationOption,
  formatCurrency,
  formatWeekYear
} = useSpecialSettlement()

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
  <main class="relative min-h-screen bg-slate-100 pb-[6rem]">
    <!-- Navigation Header -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop
        label="Liquidación Especial"
        :back="true"
      />
    </div>

    <SectionContainer>
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="flex items-center gap-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="text-gray-600">Cargando liquidación especial...</span>
        </div>
      </div>

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
      <div v-else-if="hasData && settlement && balanceData">
        <!-- Settlement Header -->
        <SpecialSettlementHeader
          :settlement="settlement"
          :format-week-year="formatWeekYear"
        />

        <!-- Balance Card -->
        <BalanceCard
          :balance-data="balanceData"
          :settlement="settlement"
          :format-currency="formatCurrency"
        />

        <!-- Liquidation Proposal -->
        <LiquidationProposal
          :pending-balance="settlement.saldo"
          :liquidation-options="liquidationOptions"
          :selected-discount-percentage="selectedDiscountPercentage"
          :format-currency="formatCurrency"
          @select-option="handleSelectOption"
        />
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