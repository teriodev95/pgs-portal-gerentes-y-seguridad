<script lang="ts" setup>
import { ref } from 'vue'
import { toCurrency } from '@/shared/utils'
import CardContainer from '@/shared/components/CardContainer.vue'
import DataField from '@/shared/components/DataField.vue'
import type { IManagementDashboard } from '@/features/entity/types'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface Props {
  data: IManagementDashboard;
}

defineProps<Props>()
const isDebitosOpen = ref(false)
</script>

<template>
  <!-- Métricas de Clientes -->
  <CardContainer title="Métricas de Clientes">
    <DataField label="Clientes" :value="data.clientes" />
    <DataField label="Clientes Cobrados" :value="data.clientesCobrados" />
    <DataField label="No Pagos" :value="data.noPagos" />
    <DataField label="Pagos Reducidos" :value="data.pagosReducidos" />
  </CardContainer>

  <!-- Operaciones Financieras -->
  <CardContainer title="Operaciones y Ajustes Financieros">
    <DataField label="Cobranza Total" :value="toCurrency(data.cobranzaTotal)" />
    <DataField label="Débito Faltante" :value="toCurrency(data.debitoFaltante)" />
    <DataField label="Efectivo en Campo" :value="toCurrency(data.efectivoEnCampo)" />
    <DataField label="Liquidaciones" :value="toCurrency(data.liquidaciones)" />
    <DataField label="Monto Excedente" :value="toCurrency(data.montoExcedente)" />
    <DataField label="Multas" :value="toCurrency(data.multas)" />
    <DataField label="Número Liquidaciones" :value="data.numeroLiquidaciones" />
    <DataField label="Número Ventas" :value="data.numeroVentas" />
    <DataField label="Rendimiento" :value="toCurrency(data.rendimiento)" />
    <DataField label="Suma Asignaciones" :value="toCurrency(data.sumaAsignaciones)" />
    <DataField label="Total Cobranza Pura" :value="toCurrency(data.totalCobranzaPura)" />
    <DataField label="Total Descuento" :value="toCurrency(data.totalDescuento)" />
    <DataField label="Ventas" :value="toCurrency(data.ventas)" />
  </CardContainer>

    <!-- Débitos Diarios -->
  <CardContainer title="Débitos Diarios">
    <Collapsible v-model:open="isDebitosOpen">
      <CollapsibleTrigger class="w-full text-left p-2 hover:bg-gray-50 rounded border border-gray-200 mb-2 flex justify-between items-center">
        <span class="property-label text-gray-400">Ver débitos por día</span>
        <svg
          :class="{ 'rotate-180': isDebitosOpen }"
          class="w-4 h-4 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent class="space-y-2">
        <DataField label="Débito Miércoles" :value="toCurrency(data.debitoMiercoles)" />
        <DataField label="Débito Jueves" :value="toCurrency(data.debitoJueves)" />
        <DataField label="Débito Viernes" :value="toCurrency(data.debitoViernes)" />
      </CollapsibleContent>
    </Collapsible>
    <DataField label="Débito Total" :value="toCurrency(data.debitoTotal)" />
  </CardContainer>
</template>