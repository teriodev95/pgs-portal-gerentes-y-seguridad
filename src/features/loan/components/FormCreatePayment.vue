<script setup lang="ts">
import type { ICobranza } from '@/interfaces';
import { RecoverySource, PaymentSource } from '@/features/loan/types';
import { computed } from 'vue';
import ArrowRightIcon from '@/shared/components/icons/ArrowRightIcon.vue';

// Props and emits
interface PaymentFormModel {
  amount: number;
  paymentSource: PaymentSource;
  paymentRecovery: RecoverySource;
}

interface Props {
  selectedPayment?: ICobranza;
  isProcessing: boolean;
  showAmountInput?: boolean; // <--- nueva prop
}

const model = defineModel<PaymentFormModel>({
  default: () => ({
    amount: 1,
    paymentSource: PaymentSource.CLIENT,
    paymentRecovery: RecoverySource.AGENT,
  }),
});

const $props = defineProps<Props>();

// Constants
const recoveryOptions = Object.values(RecoverySource);
const sourceOptions = Object.values(PaymentSource);

// Computed properties
const amountBorderColor = computed(() => {
  if (!$props.selectedPayment) return '';

  const amount = model.value.amount;
  if (amount === 0) {
    return 'border-red-500';
  } else if (amount < $props.selectedPayment.tarifa) {
    return 'border-yellow-500';
  } else {
    return 'border-green-500';
  }
});

const isNoPago = computed(() => {
  if ($props.showAmountInput === false) return false;
  return model.value.amount === 0;
});

// Methods
function onAmountChange(val: number) {
  model.value.amount = val;
}
function onPaymentSourceChange(val: PaymentSource) {
  model.value.paymentSource = val;
}
function onPaymentRecoveryChange(val: RecoverySource) {
  model.value.paymentRecovery = val;
}

function submitPayment() {
  console.log('Submitting payment:', model.value);
}

</script>

<template>
  <form @submit.prevent="submitPayment" class="flex flex-col items-center gap-y-4 p-4">
    <!-- Payment Amount Input -->
    <input type="number" step="0.01" v-if="showAmountInput"
      class="w-[60%] border-l-0 border-r-0 border-t-0 border-gray-400 bg-none p-2 text-center text-4xl font-bold text-blue-700 outline-none focus:outline-none"
      :class="[amountBorderColor]" placeholder="$" v-model="model.amount" min="0" :disabled="$props.isProcessing" />

    <!-- Payment Source Selection - Only shown for payments > 0 -->
    <div class="space-y-2 h-24 flex flex-col items-center justify-center">
      <template v-if="!isNoPago">
        <h1 class="title text-center">¿Quién pago?</h1>

        <div class="grid grid-cols-3 gap-4">
          <p v-for="option in sourceOptions" :key="option" class="p-2 text-center cursor-pointer border rounded-md"
            :class="[
              model.paymentSource === option
                ? 'border-blue-800 text-blue-800'
                : 'border-gray-400 text-gray-400'
            ]" @click="onPaymentSourceChange(option)" :tabindex="$props.isProcessing ? -1 : 0">
            {{ option }}
          </p>
        </div>
      </template>
    </div>

    <!-- Recovery Source Selection - Only shown for payments > 0 -->
    <div class="space-y-2 h-24 flex flex-col items-center justify-center">
      <template v-if="!isNoPago">
        <h1 class="title text-center">¿Quién recupero?</h1>

        <div class="grid grid-cols-3 gap-4">
          <p v-for="option in recoveryOptions" :key="option"
            class="p-2 text-center cursor-pointer border rounded-md capitalize" :class="[
              model.paymentRecovery === option
                ? 'border-blue-800 text-blue-800'
                : 'border-gray-400 text-gray-400'
            ]" @click="onPaymentRecoveryChange(option)" :tabindex="$props.isProcessing ? -1 : 0">
            {{ option }}
          </p>
        </div>
      </template>
    </div>
  </form>
</template>