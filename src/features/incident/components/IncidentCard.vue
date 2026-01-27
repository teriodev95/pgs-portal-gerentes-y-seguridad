<script setup lang="ts">
import { formatToHumanDate } from '@/shared/utils';
import { toCurrency } from '@/shared/utils';
import type { Component } from 'vue';
import type { IIncident } from '../types';

// Components
import IncidentIcon from '@/shared/components/icons/IncidentIcon.vue';
import ReplenishmentIcon from '@/shared/components/icons/ReplenishmentIcon.vue';
import PayrollIcon from '@/shared/components/icons/PayrollIcon.vue';
import TextCT from '@/shared/components/ui/TextCT.vue';

// Props & Emits definition
interface Props {
  incident: IIncident;
}

defineProps<Props>();

// Constants
const categoryIcons: Record<IIncident['categoria'], Component> = {
  incidente: IncidentIcon,
  reposicion: ReplenishmentIcon,
  nomina: PayrollIcon,
};
</script>

<template>
  <div class="flex justify-between items-center gap-4  rounded-lg border bg-white p-4">
    <figure class="size-8">
      <component class="size-8" :is="categoryIcons[incident.categoria]" />
    </figure>

    <div class="flex-1 space-y-2">
      <TextCT variant="title" class="capitalize">{{ incident.categoria }}</TextCT>

      <div class="space-y-0.5">
        <TextCT variant="secondary" class="capitalize">{{ incident.tipo }}</TextCT>
        <TextCT variant="secondary" class="capitalize">{{ toCurrency(incident.monto) }}</TextCT>
        <TextCT variant="tertiary" class="capitalize">{{ formatToHumanDate(incident.fecha) }}</TextCT>
      </div>
    </div>
  </div>
</template>