<script setup lang="ts">
import { formatToHumanDate, toCurrency } from '@/shared/utils';
import { ROUTE_NAME } from '@/router';
import { useRouter } from 'vue-router';
import type { WeeklyExpense } from '../types';

// Components
import CardContainer from '@/shared/components/CardContainer.vue';
import BtnComponent from '@/shared/components/BtnComponent.vue';
import EyeIcon from '@/shared/components/icons/EyeIcon.vue';
import ToolsIcon from '@/shared/components/icons/ToolsIcon.vue';

import IconoCasetas from '/icons/casetas.svg'
import IconoCelular from '/icons/phone.svg'
import IconoGasolina from '/icons/gasolina.svg'
import IconoMantenimiento from '/icons/mantenimineto2.svg'
import IconoOtro from '/icons/otros.svg'
import TextCT from '@/shared/components/ui/TextCT.vue';

// Interface - Props - Emits
interface Props {
  expense: WeeklyExpense;
}

interface Emits {
  (event: 'action:show-details', weeklyExpense: WeeklyExpense): void;
}

const $props = defineProps<Props>();
const $emit = defineEmits<Emits>();

// Services, Composables and Stores initialization
const $router = useRouter()

// State definitions
const categoryIcons: Record<WeeklyExpense['tipoGasto'], string> = {
  CASETAS: IconoCasetas,
  CELULAR: IconoCelular,
  GASOLINA: IconoGasolina,
  MANTENIMIENTO_VEHICULAR: IconoMantenimiento,
  OTROS: IconoOtro,
};

// Methods
function navigateToCorrectionPage() {
  $router.push({
    name: ROUTE_NAME.RECORD_CORRECTION,
    params: {
      type: 'gasto',
      id: $props.expense.id,
      amount: $props.expense.monto.toString()
    }
  })
}

function showExpenseDetails() {
  $emit('action:show-details', $props.expense)
}
</script>

<template>
  <CardContainer>
    <div class="flex justify-between items-center gap-4">
      <figure class="size-8">
        <img :src="categoryIcons[expense.tipoGasto]" :alt="expense.tipoGasto" />
      </figure>

      <div class="flex-1 space-y-2">
        <TextCT variant="title">{{ expense.tipoGasto }}</TextCT>

        <div class="space-y-2">
          <TextCT v-if="expense.concepto" variant="primary">Concepto: {{ expense.concepto }}</TextCT>
          <TextCT v-if="expense.litros" variant="primary">{{ expense.litros }}</TextCT>
          <TextCT variant="primary">{{ formatToHumanDate(expense.fecha) }}</TextCT>
          <TextCT variant="secondary">{{ toCurrency(expense.monto) }}</TextCT>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <BtnComponent 
        variant="primary" 
        size="sm" 
        full-width 
        @click="showExpenseDetails"
      >
        <template #icon-left>
          <EyeIcon class="size-5" />
        </template>
        Ver detalles
      </BtnComponent>

      <BtnComponent 
        variant="primary" 
        outline 
        size="sm" 
        full-width 
        @click="navigateToCorrectionPage"
      >
        <template #icon-left>
          <ToolsIcon class="size-5" />
        </template>
        Solicitar corrección
      </BtnComponent>
    </div>
  </CardContainer>
</template>