<script setup lang="ts">
import CardContainer from '@/shared/components/CardContainer.vue';
import type { ISpecialSettlement } from '../types';
import DataField from '@/shared/components/DataField.vue';
import { toCurrency } from '@/shared/utils';

interface Props {
  data: ISpecialSettlement
}

defineProps<Props>();
</script>

<template>
  <CardContainer title="Información General">
    <DataField label="Cliente" :value="data.cliente" />
    <DataField label="Gerencia" :value="data.gerencia" />
    <DataField label="Agente" :value="data.agente" />
    <DataField label="Semana de Inicio" :value="data.semana_inicio" />
    <DataField label="Año de Inicio" :value="data.anio_inicio"/>
    <DataField label="Plazo en Semanas" :value="data.plazo_semanas" />
    <DataField label="Semanas Transcurridas" :value="data.semanas_transcurridas" />
    <DataField label="Última Semana de Pago" :value="data.ultima_semana_pago" />
    <DataField label="Último Año de Pago" :value="data.ultimo_anio_pago" />
  </CardContainer>


  <CardContainer title="Detalles Financieros">
    <DataField label="Semanas Sin Pagar" :value="data.semanas_sin_pagar" />
    <DataField label="Número de Pagos" :value="data.numero_pagos" />
    <DataField label="Comisión de Cobranza" :value="toCurrency(data.comision_cobranza)" />
    <DataField label="Comisión de Venta" :value="data.comision_venta" />
    <DataField label="Comisión Total" :value="toCurrency(data.comision_total)" />
    <DataField label="Por Recuperar" :value="toCurrency(data.por_recuperar)" />
    <DataField label="Faltante" :value="toCurrency(data.faltante)"/>
    <DataField label="Descuento Disponible" :value="toCurrency(data.descuento_disponible)" />
    <DataField label="Status Recuperación" :value="data.status_recuperacion"/>
  </CardContainer>

  <CardContainer title="Opciones de Liquidación">
    <DataField label="Liquida con 10%" :value="toCurrency(data.liquida_con_10_porciento)" />
    <DataField label="Liquida con 20%" :value="toCurrency(data.liquida_con_20_porciento)" />
    <DataField label="Liquida con 30%" :value="toCurrency(data.liquida_con_30_porciento)" />
    <DataField label="Liquida con 40%" :value="toCurrency(data.liquida_con_40_porciento)" />
    <DataField label="Liquida con 50%" :value="toCurrency(data.liquida_con_50_porciento)" />
  </CardContainer>
</template>
