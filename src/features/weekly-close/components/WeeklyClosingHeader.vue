<script setup lang="ts">
import { useCierreSemanalStore } from '@/features/weekly-close/stores';
import { toCurrency } from '@/shared/utils';
import DataField from '@/shared/components/DataField.vue';
import CardContainer from '@/shared/components/CardContainer.vue';
import TextCT from '@/shared/components/ui/TextCT.vue';

const $weeklyCloseStore = useCierreSemanalStore()
</script>

<template>
  <CardContainer v-if="$weeklyCloseStore.weeklyClose" title="Resumen Semanal">
    <TextCT>Detalle de las métricas de rendimiento de la semana</TextCT>
    <DataField label="Semana" :value="$weeklyCloseStore.weeklyClose.resumenSemanal.semana" />
    <DataField label="Gerencia" :value="$weeklyCloseStore.weeklyClose.resumenSemanal.gerencia" />
    <DataField label="Gerente" :value="$weeklyCloseStore.weeklyClose.resumenSemanal.gerente" />
    <DataField label="Agente" :value="$weeklyCloseStore.weeklyClose.resumenSemanal.agente" />
    <DataField label="Rendimiento"
      :notice="`Debito NO impacta (${toCurrency($weeklyCloseStore.weeklyClose.rendimientoFun.debitoNoImpacta)}) ● Rendimiento general (%${$weeklyCloseStore.weeklyClose.rendimientoFun.rendimientoGeneral})`"
      :value="$weeklyCloseStore.weeklyClose.resumenSemanal.rendimiento" />

    <hr class="line" />

    <DataField label="Total de clientes" :value="$weeklyCloseStore.weeklyClose.resumenSemanal.clientes"
      notice="Total clientes de la agencia" />

    <DataField label="No Pagos" notice="Total de clientes con no pago"
      :value="$weeklyCloseStore.weeklyClose.resumenSemanal.noPagos" />

    <DataField label="Pagos Reducidos" notice="Total de clientes con pagos reducidos"
      :value="$weeklyCloseStore.weeklyClose.resumenSemanal.pagosReducidos" />

    <DataField label="Clientes Liquidados" :value="$weeklyCloseStore.weeklyClose.resumenSemanal.clientesLiquidados ?? 0"/>
  </CardContainer>
</template>