<script setup lang="ts">
import { ref } from 'vue'
import type { ISpecialSettlement } from '../types'
import { toCurrency } from '@/shared/utils';
import CardContainer from '@/shared/components/CardContainer.vue';
import TextCT from '@/shared/components/ui/TextCT.vue';
import DataField from '@/shared/components/DataField.vue';

interface Props {
  settlement: ISpecialSettlement
}

defineProps<Props>()

const showCommissions = ref(false)

function toggleCommissionBreakdown() {
  showCommissions.value = !showCommissions.value
}
</script>

<template>
  <CardContainer>
    <TextCT as="h2" variant="title" class="flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
        </path>
      </svg>
      Balance del Negocio
    </TextCT>

    <TextCT>
      Comparativa entre inversión realizada y recuperación real.
    </TextCT>

    <DataField label="Inversión Total" notice="(Préstamo + Comisiones)" :value="toCurrency(settlement.por_recuperar)" />
    <DataField label="Recuperado" notice="(Pagos del Cliente)" :value="toCurrency(settlement.cobrado)" />

    <!-- Divider -->
    <hr class="line" />

    <!-- Capital at Risk -->
    <DataField label="Capital en Riesgo" notice="(Necesario para punto de equilibrio)"
      :value="toCurrency(settlement.faltante)" />

    <!-- Commission Breakdown Link -->
    <div class="mt-4 pt-4 border-t border-gray-100">
      <button class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        @click="toggleCommissionBreakdown">
        {{ showCommissions ? 'Ocultar desglose de comisiones' : 'Ver desglose de comisiones' }}
        <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-90': showCommissions }" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>

    <!-- Commission Breakdown Details -->
    <div v-if="showCommissions" class="mt-4 pt-4 space-y-2 border-t border-gray-100">
      <TextCT as="h4" variant="paragraph-bold">Desglose de Comisiones</TextCT>
      <DataField label="Comisión de Cobranza" :value="toCurrency(settlement.comision_cobranza)" />
      <DataField label="Comisión de Venta" :value="toCurrency(settlement.comision_venta)" />
      <div class="border-t border-gray-200"></div>
      <DataField label="Total Comisiones" :value="toCurrency(settlement.comision_total)" />
    </div>
  </CardContainer>
</template>
