<script setup lang="ts">
import { ROUTE_NAME } from '@/router'
import { useMoneyTabulation } from '../composables'

// Components
import NavbarTop from '@/shared/components/NavbarTop.vue'
import MoneyTabulator from '@/features/tabulator/components/MoneyTabulator.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'

// Composables
const {
  // State
  currentTabulationData,
  hasTabulationForCurrentWeek,
  isLoadingTabulation,
  
  // Methods
  saveTabulationData
} = useMoneyTabulation()
</script>

<template>
  <main class="min-h-screen bg-slate-100">
    <!-- Header -->
    <div class="block p-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 text-green-600">
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop label="Tabulador" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
      </div>
    </div>

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
  </main>
</template>