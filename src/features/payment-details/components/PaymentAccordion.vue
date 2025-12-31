<script setup lang="ts">
import {
  FwbAccordion,
  FwbAccordionPanel,
  FwbAccordionHeader,
  FwbAccordionContent
} from 'flowbite-vue'
import { computed } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { IPayment } from '../types'
import PaymentCard from './PaymentCard.vue'

interface Props {
  historialList: IPayment[]
}

interface Emits {
  (e: 'paymentAction', action: 'showMap' | 'correction', payment: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const sortedHistorialList = computed(() => {
  return [...props.historialList].sort((a, b) => {
    if (a.anio !== b.anio) {
      return b.anio - a.anio;
    }
    return b.semana - a.semana;
  });
});

function handlePaymentAction(action: 'showMap' | 'correction', payment: any) {
  emit('paymentAction', action, payment)
}
</script>

<template>
  <FwbAccordion>
      <FwbAccordionPanel v-for="(payment, paymentIndex) in sortedHistorialList" :key="`payment-${paymentIndex}`">
        <FwbAccordionHeader>
          <div class="flex w-full items-center justify-between">
            <span>Semana {{ payment.semana }} / {{ payment.anio }}</span>
            <span>{{ toCurrency(payment.monto) }}</span>
          </div>
        </FwbAccordionHeader>

        <FwbAccordionContent>
          <PaymentCard
            :payment="payment"
            @payment-action="handlePaymentAction"
          />
        </FwbAccordionContent>
      </FwbAccordionPanel>
  </FwbAccordion>
</template>