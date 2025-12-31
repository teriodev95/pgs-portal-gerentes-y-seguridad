<script setup lang="ts">
import { toCurrency } from '@/shared/utils'
import ProgressBar from '@/shared/components/ProgressBar.vue'
import { LOAN_FIELD_LABELS, LOAN_BUTTON_LABELS } from '@/features/loan/constants'

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
  <div class="border bg-white p-4">
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
    <div class="mt-2">
      <ProgressBar :progress="parseInt(porcentajeCobrado.toString())" />
    </div>

    <!-- Client Summary -->
    <div class="mt-2">
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
    <div class="mt-2">
      <button 
        class="text-clue-500 w-full rounded-lg border border-blue-800 p-2 text-center"
        @click="$emit('navigate-to-history')"
      >
        {{ LOAN_BUTTON_LABELS.HISTORY }}
      </button>
    </div>

    <div class="mt-2">
      <button
        class="text-clue-500 w-full rounded-lg border border-blue-800 p-2 text-center disabled:opacity-50"
        @click="$emit('settlement-request')"
        :disabled="isRegionalButtonDisabled || isSettlementButtonDisabled"
      >
        {{ LOAN_BUTTON_LABELS.LIQUIDATE }}
      </button>
    </div>

    <!--
      <div class="mt-2">
        <button
          class="text-clue-500 w-full rounded-lg border border-blue-800 p-2 text-center disabled:opacity-50"
          @click="$emit('navigate-to-special-settlement')"
          :disabled="isRegionalButtonDisabled"
        >
          {{ LOAN_BUTTON_LABELS.SPECIAL_SETTLEMENT }}
        </button>
      </div>
    -->
  </div>
</template>