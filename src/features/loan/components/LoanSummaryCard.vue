<script setup lang="ts">
import { toCurrency } from '@/shared/utils'
import ProgressBar from '@/shared/components/ProgressBar.vue'
import { LOAN_FIELD_LABELS, LOAN_BUTTON_LABELS } from '@/features/loan/constants'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import DataField from '@/shared/components/DataField.vue'

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
      <DataField orientation="vertical" :label="LOAN_FIELD_LABELS.COLLECTED" :value="toCurrency(cobrado)" />
      <DataField orientation="vertical" :label="LOAN_FIELD_LABELS.BALANCE" :value="toCurrency(saldo)" />
    </div>

    <!-- Progress Bar -->
    <ProgressBar :progress="parseInt(porcentajeCobrado.toString())" />

    <!-- Client Summary -->
    <DataField :label="LOAN_FIELD_LABELS.CLIENT" :value="clientName" />
    <DataField :label="LOAN_FIELD_LABELS.STATUS" :value="status" />


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
        :disabled="isSettlementButtonDisabled"
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