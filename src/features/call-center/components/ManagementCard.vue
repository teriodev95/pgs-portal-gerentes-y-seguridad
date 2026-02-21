<script lang="ts" setup>
import CardContainer from '@/shared/components/CardContainer.vue';
import type { ICallCenterSummaryReport } from '../types';
import TextCT from '@/shared/components/ui/TextCT.vue';

// Interface - Props - Emits
interface Props {
  tarjetas: ICallCenterSummaryReport[];
}

interface Emits {
  (e: 'selectWeekAndManagement', gerencia: string, semana: number, anio: number): void;
}
defineEmits<Emits>();
defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-2 gap-4 content-start">
    <CardContainer v-for="tarjeta in tarjetas" :key="`${tarjeta.gerencia}-${tarjeta.semana}`"
      :title="tarjeta.gerencia"
      @click="$emit('selectWeekAndManagement', tarjeta.gerencia, tarjeta.semana, tarjeta.anio)">
      <TextCT variant="tertiary">Reportes: {{ tarjeta.reportes }}</TextCT>
      <div class="flex justify-between gap-2">
        <TextCT>AÑO {{ tarjeta.anio }}</TextCT>
        <TextCT>#SEM {{ tarjeta.semana }}</TextCT>
      </div>
    </CardContainer>
  </div>
</template>

<style>
.circle-progress__percentage {
  font-size: 10px;
}
</style>