<script setup lang="ts">
import { ROUTE_NAME } from '@/router'
import { useRouter } from 'vue-router'
import { useMoneyTabulation } from '../composables'

// Components
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import MoneyTabulator from '@/features/tabulator/components/MoneyTabulator.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'

// Composables
const router = useRouter()

const {
  // State
  currentTabulationData,
  hasTabulationForCurrentWeek,
  isLoadingTabulation,

  // Methods
  saveTabulationData
} = useMoneyTabulation()

// Methods
function handleBack() {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Tabulador"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Content -->
    <section class="space-y-4 p-2">
      <!-- Loading State -->
      <LoadSkeleton v-if="isLoadingTabulation" :items="6" />

      <!-- Tabulation Form -->
      <MoneyTabulator
        v-else
        @submit:tabulation="saveTabulationData"
        :has-current-week-tabulation="hasTabulationForCurrentWeek"
        :tabulation="currentTabulationData"
      />
    </section>
  </MainCT>
</template>