<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import type { ExpenseFormData, WeeklyExpense } from '../types'
import { useWeeklyExpenses } from '../composables'

// Components
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import FloatBtn from '@/shared/components/FloatBtn.vue'
import ExpenseBottomSheet from '@/features/expense/components/ExpenseBottomSheet.vue'
import ExpensesList from '@/features/expense/components/ExpensesList.vue'

const router = useRouter()

// Composables
const {
  weeklyExpenses,
  selectedExpense,
  isLoadingExpenses,
  isSavingExpense,
  user,
  isUserManager,
  gerenciaSelected,
  hasExpenses,
  saveExpense,
  selectExpenseForEditing,
  clearSelectedExpense
} = useWeeklyExpenses()

// State definitions
const expenseBottomSheetRef = ref<InstanceType<typeof ExpenseBottomSheet>>()

// Methods
function openExpenseForm(): void {
  expenseBottomSheetRef.value?.open()
}

function closeExpenseForm(): void {
  expenseBottomSheetRef.value?.close()
}

function handleExpenseFormClose(): void {
  clearSelectedExpense()
}

function handleExpenseSelect(expense: WeeklyExpense): void {
  selectExpenseForEditing(expense)
  openExpenseForm()
}

async function handleExpenseSubmit(formData: ExpenseFormData): Promise<void> {
  try {
    await saveExpense(formData)
    closeExpenseForm()
  } catch (error) {
    // Error is handled in the composable
  }
}

function handleBack(): void {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <ExpenseBottomSheet
    ref="expenseBottomSheetRef"
    :selected-expense="selectedExpense"
    :usuario-id="user?.usuarioId || 0"
    :is-saving="isSavingExpense"
    :is-user-manager="isUserManager"
    :gerencia-selected="gerenciaSelected"
    @submit="handleExpenseSubmit"
    @closed="handleExpenseFormClose"
  />

  <div data-dial-init class="group fixed bottom-[1.5rem] right-6 z-50">
    <FloatBtn type="primary" @click="openExpenseForm" />
  </div>

  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Gastos Semanales"
      :show-back-button="true"
      @back="handleBack"
    />

    <ExpensesList
      :expenses="weeklyExpenses"
      :is-loading="isLoadingExpenses"
      :has-expenses="hasExpenses"
      @expense:select="handleExpenseSelect"
    />
  </MainCT>
</template>