<script lang="ts" setup>
import type { IManagementCard } from '../types';

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
  <div class="grid grid-cols-2 gap-4 min-h-screen content-start">
    <div v-for="tarjeta in tarjetas" :key="`${tarjeta.gerency}-${tarjeta.week}`"
      class="rounded-lg border bg-white p-4 space-y-4"
      @click="$emit('selectWeekAndManagement', tarjeta.gerency, tarjeta.week)">
      <div class="flex flex-col">
        <h4 class="text-base font-semibold">{{ tarjeta.gerency }}</h4>

        <p class="text-sm font-extralight">Reportes: {{ tarjeta.count }}</p>
      </div>
      <p class="text-lg font-extralight">#SEM {{ tarjeta.week }}</p>
      <p class="text-lg font-extralight">AÑO {{ tarjeta.year }}</p>
    </div>
  </div>
</template>

<style>
.circle-progress__percentage {
  font-size: 10px;
}
</style>