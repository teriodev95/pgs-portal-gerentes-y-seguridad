<script lang="ts" setup>
import { toCurrency } from '@/shared/utils'
import type { IAgencyDashboard } from '@/shared/types'
import DataField from '@/shared/components/DataField.vue'

interface Props {
  agency: IAgencyDashboard
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-2">
    <DataField label="Agencia" :value="agency.agencia" />
    <DataField label="No. Clientes" :value="agency.clientes" />
    <DataField label="No. Liquidaciones" :value="agency.numeroLiquidaciones" />
    <DataField label="Clientes Cobrados" :value="agency.clientesCobrados" />
    <DataField label="Reducidos" :value="agency.pagosReducidos" />
    <DataField label="Débito Miércoles" :value="toCurrency(agency.debitoMiercoles)" />
    <DataField label="Débito Jueves" :value="toCurrency(agency.debitoJueves)" />
    <DataField label="Débito Total" :value="toCurrency(agency.debitoTotal)" />
    <DataField label="Rendimiento" :value="agency.rendimiento" />
    <DataField label="Descuento" :value="agency.totalDeDescuento" />
    <DataField label="Cobranza Pura" :value="toCurrency(agency.totalCobranzaPura)" />
    <DataField label="Excedentes" :value="toCurrency(agency.montoExcedente)" />
    <DataField label="Multas" :value="toCurrency(agency.multas ?? 0)" />
    <DataField label="Liquidaciones" :value="toCurrency(agency.liquidaciones)" />
    <DataField label="Cobranza total" :value="toCurrency(agency.cobranzaTotal)" />
  </div>
</template>