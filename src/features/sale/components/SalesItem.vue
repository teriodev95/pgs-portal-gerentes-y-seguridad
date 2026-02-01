<script setup lang="ts">
import { ROUTE_NAME } from '@/router';
import { toCurrency } from '@/shared/utils';
import { useRouter } from 'vue-router';
import type { SaleDetails } from '../types';

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import CardContainer from '@/shared/components/CardContainer.vue';
import BtnComponent from '@/shared/components/BtnComponent.vue';
import EyeIcon from '@/shared/components/icons/EyeIcon.vue';
import ToolsIcon from '@/shared/components/icons/ToolsIcon.vue';
import DataField from '@/shared/components/DataField.vue';

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */
interface Emits {
  (event: 'action:show-details', sale: SaleDetails): void;
}

interface Props {
  sale: SaleDetails;
}

const $props = defineProps<Props>();
const $router = useRouter()
defineEmits<Emits>();

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */
const navigateToCorrection = () => {
  $router.push({
    name: ROUTE_NAME.RECORD_CORRECTION,
    params: {
      type: 'venta',
      id: $props.sale.id,
      amount: $props.sale.monto.toString()
    }
  })
}
</script>

<template>
  <CardContainer>
    <DataField label="Agencia" :value="sale.agencia" />
    <DataField label="Cliente" :value="sale.nombreCliente" />
    <DataField label="Tipo" :value="sale.tipo" />
    <DataField label="Monto" :value="toCurrency(sale.monto)" />

    <div class="space-y-2">
      <BtnComponent variant="primary" size="sm" full-width @click="$emit('action:show-details', sale)">
        <template #icon-left>
          <EyeIcon class="size-5" />
        </template>
        Ver detalles
      </BtnComponent>

      <BtnComponent variant="primary" outline size="sm" full-width @click="navigateToCorrection">
        <template #icon-left>
          <ToolsIcon class="size-5" />
        </template>
        Solicitar corrección
      </BtnComponent>
    </div>
  </CardContainer>
</template>
