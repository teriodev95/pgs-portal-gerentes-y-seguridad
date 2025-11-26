<script lang="ts" setup>
import { ref } from 'vue'
import { toCurrency } from '@/shared/utils'
import CardContainer from '@/shared/components/CardContainer.vue'
import DataField from '@/shared/components/DataField.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import DebtsDialog from './DebtsDialog.vue'
import type { IManagementDashboard, IManagementDebts } from '@/features/entity/types'

interface Props {
  data: IManagementDashboard
  managementDebts?: IManagementDebts
  isLoading?: boolean
}

defineProps<Props>()

const isDebtsDialogOpen = ref(false)

function openDebtsDialog(): void {
  isDebtsDialogOpen.value = true
}

function closeDebtsDialog(): void {
  isDebtsDialogOpen.value = false
}
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
    <DataField label="Rendimiento" :value="`%${data.rendimiento.toFixed(2)}`" />
    <DataField label="Suma Asignaciones" :value="toCurrency(data.sumaAsignaciones)" />
    <DataField label="Total Cobranza Pura" :value="toCurrency(data.totalCobranzaPura)" />
    <DataField label="Total Descuento" :value="toCurrency(data.totalDescuento)" />
    <DataField label="Ventas" :value="toCurrency(data.ventas)" />
  </CardContainer>

    <!-- Débitos Diarios -->
  <CardContainer title="Débitos Diarios">
    <DataField label="Débito Miércoles" :value="toCurrency(data.debitoMiercoles)" />
    <DataField label="Débito Jueves" :value="toCurrency(data.debitoJueves)" />
    <DataField label="Débito Viernes" :value="toCurrency(data.debitoViernes)" />
    <DataField label="Débito Total" :value="toCurrency(data.debitoTotal)" />

    <div v-if="managementDebts && managementDebts.reportes.length > 0" class="mt-4 pt-4 border-t border-gray-200">
      <BtnComponent @click="openDebtsDialog" class="w-full">
        Ver desglose por Agencia 
      </BtnComponent>
    </div>
  </CardContainer>

  <DebtsDialog
    :is-open="isDebtsDialogOpen"
    :reports="managementDebts?.reportes || []"
    :is-loading="isLoading || false"
    @dialog:close="closeDebtsDialog"
  />
</template>