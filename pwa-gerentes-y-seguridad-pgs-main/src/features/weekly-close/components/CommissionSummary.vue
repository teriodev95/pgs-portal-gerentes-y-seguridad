<script setup lang="ts">
import { toCurrency } from '@/shared/utils';

interface Commission {
  comisionCobranzaPagadaEnSemana: number
  comisionVentasPagadaEnSemana: number
  bonosPagadosEnSemana: number
}

interface Props {
  commissions: Commission
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-2">
    <h1 class="title">Comisiones pagadas en la semana:</h1>

    <div class="space-y-1">
      <div class="flex justify-between gap-2">
        <p class="font-300 text-gray-400">Comisión por cobranza</p>
        <p class="font-md-700 text-blue-800">
          {{ toCurrency(commissions.comisionCobranzaPagadaEnSemana) }}
        </p>
      </div>

      <div class="flex justify-between gap-2">
        <p class="font-300 text-gray-400">Comisión por Ventas</p>
        <p class="font-md-700 text-blue-800">
          {{ toCurrency(commissions.comisionVentasPagadaEnSemana) }}
        </p>
      </div>

      <div class="flex justify-between gap-2">
        <p class="font-300 text-gray-400">Bonos</p>
        <p class="font-md-700 text-blue-800">
          {{ toCurrency(commissions.bonosPagadosEnSemana) }}
        </p>
      </div>
    </div>
  </div>
</template>