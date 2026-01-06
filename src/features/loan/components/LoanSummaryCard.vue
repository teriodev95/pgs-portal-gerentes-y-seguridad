<script setup lang="ts">
import { toCurrency } from '@/shared/utils'
import ProgressBar from '@/shared/components/ProgressBar.vue'
import { LOAN_FIELD_LABELS, LOAN_BUTTON_LABELS } from '@/features/loan/constants'
import BtnComponent from '@/shared/components/BtnComponent.vue'

interface Props {
  cobrado: number
  saldo: number
  porcentajeCobrado: number
  clientName: string
  status: string
  isRegionalButtonDisabled: boolean
  isSettlementButtonDisabled: boolean
}

interface Emits {
  (event: 'navigate-to-history'): void
  (event: 'settlement-request'): void
  (event: 'navigate-to-special-settlement'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div class="border bg-white p-4 space-y-2">
    <!-- Payment Summary -->
    <div class="flex justify-between">
      <div>
        <h3 class="font-300 text-sm text-gray-400">{{ LOAN_FIELD_LABELS.COLLECTED }}</h3>
        <p class="font-bold text-blue-900">{{ toCurrency(cobrado) }}</p>
      </div>
      <div>
        <h3 class="font-300 text-sm text-gray-400">{{ LOAN_FIELD_LABELS.BALANCE }}</h3>
        <p class="font-bold text-blue-900">{{ toCurrency(saldo) }}</p>
      </div>
    </div>

    <!-- Progress Bar -->
    <ProgressBar :progress="parseInt(porcentajeCobrado.toString())" />

    <!-- Client Summary -->
    <div>
      <ul class="mt-2 space-y-2">
        <li class="flex justify-between gap-10">
          <div class="font-300 text-gray-400">{{ LOAN_FIELD_LABELS.CLIENT }}</div>
          <div class="font-md-700 text-blue-800">{{ clientName }}</div>
        </li>
        <li class="flex justify-between gap-10">
          <div class="font-300 text-gray-400">{{ LOAN_FIELD_LABELS.STATUS }}</div>
          <div class="font-md-700 text-blue-800">{{ status }}</div>
        </li>
      </ul>
    </div>

    <!-- Action Buttons -->
    <div class="space-y-2">
      <BtnComponent 
        full-width
        outline
        variant="secondary"
        @click="$emit('navigate-to-history')"
      >
        {{ LOAN_BUTTON_LABELS.HISTORY }}
      </BtnComponent>
      <BtnComponent
        :disabled="isRegionalButtonDisabled || isSettlementButtonDisabled"
        full-width
        outline
        variant="secondary"
        @click="$emit('settlement-request')"
      >
        {{ LOAN_BUTTON_LABELS.LIQUIDATE }}
      </BtnComponent>
    </div>
  </div>
</template>