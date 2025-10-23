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
import EyeIcon from '@/shared/components/icons/EyeIcon.vue';
import ToolsIcon from '@/shared/components/icons/ToolsIcon.vue';

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
    <div class="flex items-center justify-between gap-2">
      <p class="font-300 text-gray-400">Agencia</p>
      <p class="font-md-700 text-blue-800">{{ sale.agencia }}</p>
    </div>
    <div class="flex items-center justify-between gap-2">
      <p class="font-300 text-gray-400">Cliente</p>
      <p class="font-md-700 text-blue-800">{{ sale.nombreCliente }}</p>
    </div>
    <div class="flex items-center justify-between gap-2">
      <p class="font-300 text-gray-400">Tipo</p>
      <p class="fon t-md-700 text-blue-800">{{ sale.tipo }}</p>
    </div>
    <div class="flex items-center justify-between gap-2">
      <p class="font-300 text-gray-400">Monto</p>
      <p class="font-md-700 text-blue-800">{{ toCurrency(sale.monto) }}</p>
    </div>

    <div class="space-y-2">
      <button @click="$emit('action:show-details', sale)"
        class="w-full btn rounded-lg bg-blue-700 p-1 text-center text-sm font-medium text-white outline-none flex items-center justify-center gap-2">
        <EyeIcon class="size-5" />
        Ver detalles
      </button>
      <button @click="navigateToCorrection"
        class="w-full rounded-lg border border-blue-700 p-1 text-center text-sm font-medium text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center gap-2">
        <ToolsIcon class="size-5" />
        Solicitar corrección
      </button>
    </div>
  </CardContainer>
</template>
