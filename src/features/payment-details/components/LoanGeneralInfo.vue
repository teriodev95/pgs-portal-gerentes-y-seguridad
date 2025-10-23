<script setup lang="ts">
import { toCurrency } from '@/shared/utils';
import type { ILoan } from '@/features/loan/types'

// Interface - Props
interface Props {
  loanData: ILoan
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-md border bg-white p-4">
    <h2 class="text-lg font-bold text-blue-900">Datos Generales</h2>

    <ul class="mt-2 space-y-2">
      <li class="flex justify-between gap-10">
        <div class="font-thin">Nombre</div>
        <div class="font-semibold text-blue-900">{{ loanData.nombres }}</div>
      </li>
      <li class="flex justify-between gap-10">
        <div class="font-thin">Dirección</div>
        <div class="font-semibold text-blue-900">{{ loanData.direccion }}</div>
      </li>
      <li class="flex justify-between gap-10">
        <div class="font-thin">Teléfono</div>
        <div class="font-semibold text-blue-900">{{ loanData.telefonoCliente }}</div>
      </li>
      <li class="flex justify-between gap-10">
        <div class="font-thin">Nivel</div>
        <div class="font-semibold text-blue-900">{{ loanData.tipoDeCliente }}</div>
      </li>
      <li class="flex justify-between gap-10">
        <div class="font-thin">Otorgado</div>
        <div class="font-semibold text-blue-900">{{ toCurrency(loanData.montoOtorgado) }}</div>
      </li>
    </ul>
  </div>
</template>