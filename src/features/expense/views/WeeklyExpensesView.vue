<script setup lang="ts">
import { ref } from 'vue'
import { ROUTE_NAME } from '@/router'
import type { ExpenseFormData, WeeklyExpense } from '../types'
import { useWeeklyExpenses } from '../composables'

// Components
import NavbarTop from '@/shared/components/NavbarTop.vue'
import FloatBtn from '@/shared/components/FloatBtn.vue'
import ExpenseBottomSheet from '@/features/expense/components/ExpenseBottomSheet.vue'
import ExpensesList from '@/features/expense/components/ExpensesList.vue'

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

  <main class="min-h-screen bg-slate-100 pb-[6rem]">
    <div class="block p-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop :label="'Gastos Semanales'" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
      </div>
    </div>

    <ExpensesList 
      :expenses="weeklyExpenses"
      :is-loading="isLoadingExpenses"
      :has-expenses="hasExpenses"
      @expense:select="handleExpenseSelect"
    />
  </main>
</template>