<script setup lang="ts">
import type { WeeklyExpense } from '../types'

// Components
import WeeklyExpenseCard from './WeeklyExpenseCard.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'

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

    <EmptyCT
      v-else
      message="No hay gastos en esta semana"
      description="Aún no se han registrado gastos para esta semana. Usa el botón de abajo para agregar uno nuevo."
    />
  </section>
</template>