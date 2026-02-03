<script setup lang="ts">
import { toCurrency } from '@/shared/utils'
import DataField from '@/shared/components/DataField.vue'
import type { Liquidacion } from '../types'
import CardContainer from '@/shared/components/CardContainer.vue';
import TextCT from '@/shared/components/ui/TextCT.vue';

interface Props {
  settlement: Liquidacion
}

defineProps<Props>()
</script>

<template>
  <CardContainer>
    <DataField label="Descuento $" :value="toCurrency(settlement.descuentoDinero)" />
    <DataField label="Descuento %" :value="`${settlement.descuentoPorcentaje}%`" variant="yellow" />
    <DataField label="Sem. transcurridas" :value="settlement.semanasTranscurridas" variant="yellow" />
    <hr class="border-t border-gray-200" />
    <DataField label="Liquida con" :value="toCurrency(settlement.liquidaCon)"
      value-class="font-bold text-yellow-500 w-[50%] text-right align-middle text-2xl" />

    <TextCT variant="tertiary">
      Si el cliente LIQUIDA con DESCUENTO, no podrá subir de nivel en el próximo crédito*
    </TextCT>
  </CardContainer>
</template>