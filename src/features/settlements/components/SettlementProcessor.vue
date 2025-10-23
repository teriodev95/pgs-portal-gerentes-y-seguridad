<script setup lang="ts">
import { ref } from 'vue'
import SlideUnlock from 'vue-slide-unlock'
import FormCreatePayment from '@/features/loan/components/FormCreatePayment.vue'
import { PaymentSource, RecoverySource } from '@/features/loan/types'

interface PaymentFormData {
  amount: number
  paymentSource: PaymentSource
  paymentRecovery: RecoverySource
}

interface Props {
  isProcessing?: boolean
  paymentForm: PaymentFormData
}

interface Emits {
  'update:paymentForm': [value: PaymentFormData]
  'process:settlement': []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const slideUnlockRef = ref()
const unlockButtonColor = ref('rgb(26 86 219 / 1)')

function handleProcessSettlement() {
  // Change button color to indicate success
  unlockButtonColor.value = 'rgb(14 159 110 / 1)'
  // Emit the process event
  emit('process:settlement')
}
</script>

<template>
  <div class="space-y-3 rounded-lg border bg-white p-4">
    <FormCreatePayment
      :model-value="paymentForm"
      :selected-payment="undefined"
      :is-processing="isProcessing || false"
      :show-amount-input="false"
      @update:model-value="$emit('update:paymentForm', $event)"
    />

    <div class="space-y-2 p-5">
      <slide-unlock 
        ref="slideUnlockRef" 
        :auto-width="true" 
        :circle="true" 
        :disabled="isProcessing || false" 
        :noanimate="false"
        text="Continuar" 
        success-text="Completado" 
        name="slideunlock" 
        :style="{
          '--su-color-text-normal': 'white',
          '--su-color-bg': unlockButtonColor,
          '--su-color-progress-normal-bg': 'rgb(14 159 110 / 1)',
          '--su-color-progress-complete-bg': 'rgb(14 159 110 / 1)',
          '--su-size-padding': '0'
        }" 
        @completed="handleProcessSettlement" 
      />
    </div>
  </div>
</template>