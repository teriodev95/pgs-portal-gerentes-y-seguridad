<script setup lang="ts">
import DataField from '@/shared/components/DataField.vue';
import TextCT from '@/shared/components/ui/TextCT.vue';
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
    <TextCT variant="title">
      Comisiones pagadas en la semana
    </TextCT>

    <DataField label="Comisión por cobranza" :value="toCurrency(commissions.comisionCobranzaPagadaEnSemana)"/>
    <DataField label="Comisión por Ventas" :value="toCurrency(commissions.comisionVentasPagadaEnSemana)"/>
    <DataField label="Bonos" :value="toCurrency(commissions.bonosPagadosEnSemana)"/>
  </div>
</template>