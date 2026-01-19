<script setup lang="ts">
import { ROUTE_NAME } from '@/router'
import { useBalance } from '../composables'

// Components
import BalanceHeader from '@/features/balance/components/BalanceHeader.vue'
import BalanceSection from '@/features/balance/components/BalanceSection.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import { useRouter } from 'vue-router'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'

// Composable
const { isLoading, balance, incomeItems, expenseItems } = useBalance()
const $router = useRouter()

function handleBack() {
  $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <main class="min-h-screen bg-slate-100">
    <!-- Navigation Bar -->
    <NavbarCT
      title="Balance"
      :show-back="true"
      @back="handleBack"
    />

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