<script lang="ts" setup>
import CardContainer from '@/shared/components/CardContainer.vue';
import type { IManagementCard } from '../types';
import TextCT from '@/shared/components/ui/TextCT.vue';

// Interface - Props - Emits
interface Props {
  tarjetas: IManagementCard[];
}

interface Emits {
  (e: 'selectWeekAndManagement', gerencia: string, semana: number): void;
}
defineEmits<Emits>();
defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-2 gap-4 content-start">
    <CardContainer v-for="tarjeta in tarjetas" :key="`${tarjeta.gerency}-${tarjeta.week}`"
      :title="tarjeta.gerency"
      @click="$emit('selectWeekAndManagement', tarjeta.gerency, tarjeta.week)">
      <TextCT variant="tertiary">Reportes: {{ tarjeta.count }}</TextCT>
      <div class="flex justify-between gap-2">
        <TextCT>AÑO {{ tarjeta.year }}</TextCT>
        <TextCT>#SEM {{ tarjeta.week }}</TextCT>
      </div>
    </CardContainer>
  </div>
</template>

<style>
.circle-progress__percentage {
  font-size: 10px;
}
</style>