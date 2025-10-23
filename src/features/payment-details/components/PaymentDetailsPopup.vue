<script setup lang="ts">
import { toCurrency } from '@/shared/utils';
import type { AgenciaPagosHistorial } from '../types'

interface Props {
  payment?: AgenciaPagosHistorial
}

defineProps<Props>()
</script>

<template>
  <Transition name="slide-fade">
    <div class="fixed bottom-1 z-30 w-full p-2" v-if="payment">
      <div class="rounded-md bg-white p-4">
        <ul class="spacey-2 list-none">
          <li class="flex justify-between gap-2">
            <p>Préstamo</p>
            <p class="font-bold text-blue-900">{{ payment.prestamoId }}</p>
          </li>
          <li class="flex justify-between gap-2">
            <p>Monto</p>
            <p class="font-bold text-blue-900">{{ toCurrency(payment.monto) }}</p>
          </li>
          <li class="flex justify-between gap-2">
            <p>Fecha de Pago</p>
            <p class="font-bold text-blue-900">{{ payment.fechaPago }}</p>
          </li>
          <li class="flex justify-between gap-2">
            <p>Tarifa</p>
            <p class="font-bold text-blue-900">{{ toCurrency(payment.tarifa) }}</p>
          </li>
        </ul>
      </div>
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