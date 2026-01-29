<script setup lang="ts">
import { toCurrency } from '@/shared/utils';
import type { ILoan } from '@/features/loan/types'
import CardContainer from '@/shared/components/CardContainer.vue';
import DataField from '@/shared/components/DataField.vue';

// Interface & Props
interface Props {
  loanData: ILoan
}

defineProps<Props>()
</script>

<template>
  <CardContainer title="Datos Generales">
    <DataField label="Nombre" :value="loanData.nombres" />
    <DataField label="Dirección" :value="loanData.direccion" />
    <DataField label="Teléfono" :value="loanData.telefonoCliente" />
    <DataField label="Nivel" :value="loanData.tipoDeCliente" />
    <DataField label="Otorgado" :value="toCurrency(loanData.montoOtorgado)" />
  </CardContainer>
</template>