<script setup lang="ts">
import { formatToHumanDate, toCurrency } from '@/shared/utils';
import type { SaleDetails } from '../types';

interface Props {
  sale?: SaleDetails
}

defineProps<Props>()
</script>
<template>
  <div class="p-4 space-y-4">
    <h1 class="title">Información de la venta</h1>

    <div class="flex justify-between gap-2">
      <p class="font-300 text-gray-400">Fecha</p>
      <p v-if="sale?.fecha" class="font-md-700 text-blue-800">{{ formatToHumanDate(sale.fecha) }}</p>
    </div>
    <div class="flex justify-between gap-2">
      <p class="font-300 text-gray-400">Agencia</p>
      <p class="font-md-700 text-blue-800">{{ sale?.agencia }}</p>
    </div>
    <div class="flex justify-between gap-2">
      <p class="font-300 text-gray-400">Cliente</p>
      <p class="font-md-700 text-blue-800">{{ sale?.nombreCliente }}</p>
    </div>
    <div class="flex justify-between gap-2">
      <p class="font-300 text-gray-400">Tipo</p>
      <p class="font-md-700 text-blue-800">{{ sale?.tipo }}</p>
    </div>
    <div class="flex justify-between gap-2">
      <p class="font-300 text-gray-400">Nivel</p>
      <p class="font-md-700 text-blue-800">{{ sale?.nivel }}</p>
    </div>
    <div class="flex justify-between gap-2">
      <p class="font-300 text-gray-400">Plazo</p>
      <p class="font-md-700 text-blue-800">{{ sale?.plazo }}</p>
    </div>
    <div class="flex justify-between gap-2">
      <p class="font-300 text-gray-400">Monto</p>
      <p class="font-md-700 text-blue-800">{{ toCurrency(sale?.monto) }}</p>
    </div>
    <div class="flex justify-between gap-2">
      <p class="font-300 text-gray-400">1er Pago</p>
      <p class="font-md-700 text-blue-800">{{ toCurrency(sale?.primerPago) }}</p>
    </div>
  </div>
</template>
