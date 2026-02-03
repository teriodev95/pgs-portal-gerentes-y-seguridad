
<script setup lang="ts">
import { computed } from 'vue'
import type { ISpecialSettlement } from '../types'
import CardContainer from '@/shared/components/CardContainer.vue';
import TextCT from '@/shared/components/ui/TextCT.vue';
import DataField from '@/shared/components/DataField.vue';

interface Props {
  settlement: ISpecialSettlement
  formatWeekYear: (week: number, year: number) => string
}

const props = defineProps<Props>()

const statusBadgeClass = computed(() => {
  const status = props.settlement.status_recuperacion.toLowerCase()

  if (status === 'pendiente') {
    return 'bg-yellow-100 text-yellow-800'
  } else if (status === 'liquidado') {
    return 'bg-green-100 text-green-800'
  } else if (status === 'vencido') {
    return 'bg-red-100 text-red-800'
  }

  return 'bg-gray-100 text-gray-800'
})
</script>

<template>
  <CardContainer>
    <!-- Status Badge -->
    <div class="flex items-center gap-2 mb-2">
      <TextCT as="span" variant="tertiary">
        PRÉSTAMO {{ settlement.prestamo_id }}
      </TextCT>
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        :class="statusBadgeClass"
      >
        {{ settlement.status_recuperacion }}
      </span>
    </div>
    
    <TextCT as="h2" variant="title">
      {{ settlement.cliente }}
    </TextCT>

    <DataField label="Fecha" :value="formatWeekYear(settlement.semana_inicio, settlement.anio_inicio)"/>
    <DataField label="Agente" :value="settlement.agente"/>
    <DataField label="Semanas transcurridas" :value="settlement.semanas_transcurridas"/>
  </CardContainer>
</template>
