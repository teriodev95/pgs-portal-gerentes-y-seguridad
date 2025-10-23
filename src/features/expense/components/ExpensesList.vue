<script setup lang="ts">
import type { WeeklyExpense } from '../types'

// Components
import WeeklyExpenseCard from './WeeklyExpenseCard.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import BoxCloseOutline from '@/shared/components/icons/BoxCloseOutline.vue'

// Interface - Props - Emits
defineProps<{
  expenses: WeeklyExpense[]
  isLoading: boolean
  hasExpenses: boolean
}>()

const emit = defineEmits<{
  'expense:select': [expense: WeeklyExpense]
}>()

// Methods
function handleExpenseSelect(expense: WeeklyExpense): void {
  emit('expense:select', expense)
}
</script>

<template>
  <section class="space-y-4 p-2">
    <template v-if="hasExpenses">
      <WeeklyExpenseCard 
        v-for="expense in expenses" 
        :key="expense.urlRecibo" 
        :expense="expense"
        @action:show-details="handleExpenseSelect" 
      />
    </template>

    <LoadSkeleton v-else-if="isLoading" :items="6" class="mt-4" />

    <div v-else class="flex items-center justify-center">
      <div class="text-center text-gray-600">
        <BoxCloseOutline class="mx-auto h-28 w-28" />

        <div class="mt-2 text-center">
          <h2 class="text-2xl font-semibold">No hay gastos en esta semana</h2>
        </div>
      </div>
    </div>
  </section>
</template>