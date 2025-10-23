<script setup lang="ts">
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
    <p><strong>Identificador:</strong> {{ recordId }}</p>

    <template v-if="correctionType !== 'cierre'">
      <p><strong>Monto (Actual):</strong> {{ toCurrency(currentData.amount || 0) }}</p>
    </template>

    <template v-else>
      <p>
        <strong>Comisión por cobranza (Actual):</strong>
        {{ toCurrency(currentData.collectionCommissionPaidInWeek || 0) }}
      </p>
      <p>
        <strong>Comisión por Ventas (Actual):</strong>
        {{ toCurrency(currentData.salesCommissionPaidInWeek || 0) }}
      </p>
      <p>
        <strong>Bonos (Actuales):</strong>
        {{ toCurrency(currentData.bonusesPaidInWeek || 0) }}
      </p>
    </template>
  </div>
</template>
