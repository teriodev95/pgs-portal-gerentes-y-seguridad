<script setup lang="ts">
import type { IBalance } from '../types'
import { toCurrency } from '@/shared/utils'
import { computed } from 'vue'

// Interface - Props - Emits
type BalanceType = 'income' | 'expense'

interface BalanceItem {
  label: string
  value: keyof IBalance
}

interface Props {
  title: string
  items: BalanceItem[]
  balance: IBalance
  type: BalanceType
}

const props = defineProps<Props>()

// State definitions
const backgroundColorClass = computed(() => ({
  'bg-green-200': props.type === 'income',
  'bg-red-200': props.type === 'expense'
}))

const totalLabel = computed(() =>
  props.type === 'income' ? 'Total Ingresos' : 'Total Egresos'
)

const totalAmount = computed(() =>
  props.type === 'income'
    ? props.balance.totalIngresos
    : props.balance.totalEgresos
)
</script>

<template>
  <section>
    <!-- Header -->
    <header class="p-2 text-center" :class="backgroundColorClass">
      {{ title }}
    </header>

    <!-- Items List -->
    <div>
      <div v-for="item in items" :key="item.value" class="flex items-center justify-between p-2 border-b">
        <span class="font-light text-gray-400">
          {{ item.label }}
        </span>
        <span class="font-medium text-blue-800">
          {{ toCurrency(balance[item.value]) }}
        </span>
      </div>
    </div>

    <!-- Footer Total -->
    <footer class="flex justify-between items-center p-2 gap-2">
      <strong>{{ totalLabel }}</strong>
      <strong>{{ toCurrency(totalAmount) }}</strong>
    </footer>
  </section>
</template>