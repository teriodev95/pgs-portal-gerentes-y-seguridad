<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import type { WeeklyExpense } from '../types'
import { useExpenseData } from '../composables'
import { useExpenseStore } from '../stores'
import { useDrawer } from '@/shared/composables'

// Components
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import FloatBtn from '@/shared/components/FloatBtn.vue'
import ExpenseDrawer from '@/features/expense/components/ExpenseDrawer.vue'
import ExpensesList from '@/features/expense/components/ExpensesList.vue'

const router = useRouter()

// Stores & Composables
const expenseStore = useExpenseStore()
const expenseDrawer = useDrawer<WeeklyExpense>('expense')

// Inicializar lógica de negocio (fetch inicial en onBeforeMount)
useExpenseData()

// Methods
function handleExpenseSelect(expense: WeeklyExpense): void {
  expenseDrawer.openWith(expense)
}

function handleBack(): void {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <ExpenseDrawer />

  <div data-dial-init class="group fixed bottom-[1.5rem] right-6 z-50">
    <FloatBtn type="primary" @click="expenseDrawer.open()" />
  </div>

  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Gastos Semanales"
      :show-back-button="true"
      @back="handleBack"
    />

    <ExpensesList
      :expenses="expenseStore.expenses"
      :is-loading="expenseStore.isLoadingExpenses"
      :has-expenses="expenseStore.hasExpenses"
      @expense:select="handleExpenseSelect"
    />
  </MainCT>
</template>