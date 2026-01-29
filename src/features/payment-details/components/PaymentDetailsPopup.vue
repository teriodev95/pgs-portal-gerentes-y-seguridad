<script setup lang="ts">
import { toCurrency } from '@/shared/utils';
import type { AgenciaPagosHistorial } from '../types'
import CardContainer from '@/shared/components/CardContainer.vue';
import DataField from '@/shared/components/DataField.vue';

interface Props {
  payment?: AgenciaPagosHistorial
}

defineProps<Props>()
</script>

<template>
  <Transition name="slide-fade">
    <div class="fixed bottom-1 z-30 w-full p-2" v-if="payment">
      <CardContainer>
        <DataField label="Préstamo" :value="payment.prestamoId"/>
        <DataField label="Monto" :value="toCurrency(payment.monto)"/>
        <DataField label="Fecha de Pago" :value="payment.fechaPago"/>
        <DataField label="Tarifa" :value="toCurrency(payment.tarifa)"/>
      </CardContainer>
    </div>
  </Transition>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(50px);
  opacity: 0;
}
</style>