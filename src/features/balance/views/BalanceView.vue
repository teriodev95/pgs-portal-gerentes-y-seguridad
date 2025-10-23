<script setup lang="ts">
import { ROUTE_NAME } from '@/router'
import { useBalance } from '../composables'

// Components
import BalanceHeader from '@/features/balance/components/BalanceHeader.vue'
import BalanceSection from '@/features/balance/components/BalanceSection.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'

// Composable
const { isLoading, balance, incomeItems, expenseItems } = useBalance()
</script>

<template>
  <main class="min-h-screen bg-slate-100">
    <!-- Navigation Bar -->
    <div class="block p-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop label="Balance" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
      </div>
    </div>

    <!-- Loading State -->
    <LoadSkeleton v-if="isLoading" :items="6" class="mt-4" />

    <!-- Balance Content -->
    <SectionContainer v-else>
      <BalanceHeader />

      <template v-if="balance">
        <!-- Income Section -->
        <BalanceSection title="Ingresos" type="income" :items="incomeItems" :balance="balance" />

        <!-- Expenses Section -->
        <BalanceSection title="Egresos" type="expense" :items="expenseItems" :balance="balance" />
      </template>
    </SectionContainer>
  </main>
</template>