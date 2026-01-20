<script setup lang="ts">
import DataField from '@/shared/components/DataField.vue';
import { toCurrency } from '@/shared/utils';

interface CurrentData {
  amount?: number;
  collectionCommissionPaidInWeek?: number;
  salesCommissionPaidInWeek?: number;
  bonusesPaidInWeek?: number;
}

interface Props {
  recordId: string;
  correctionType: string;
  currentData: CurrentData;
}

defineProps<Props>();
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
    <DataField label="Identificador" :value="recordId" />

    <template v-if="correctionType !== 'cierre'">
      <DataField label="Monto (Actual)" :value="toCurrency(currentData.amount || 0)" />
    </template>

    <template v-else>
      <DataField label="Comisión por cobranza (Actual)" :value="toCurrency(currentData.collectionCommissionPaidInWeek || 0)" />
      <DataField label="Comisión por Ventas (Actual)" :value="toCurrency(currentData.salesCommissionPaidInWeek || 0)" />
      <DataField label="Bonos (Actuales)" :value="toCurrency(currentData.bonusesPaidInWeek || 0)" />
    </template>
  </div>
</template>
