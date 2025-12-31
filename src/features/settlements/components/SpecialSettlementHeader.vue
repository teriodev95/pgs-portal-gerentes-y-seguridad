<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
    <!-- Status Badge -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex flex-col">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
            PRÉSTAMO {{ settlement.prestamo_id }}
          </span>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="statusBadgeClass"
          >
            {{ settlement.status_recuperacion }}
          </span>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">
          {{ settlement.cliente }}
        </h2>
      </div>
    </div>

    <!-- Client Information Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <span class="text-gray-500">{{ formatWeekYear(settlement.semana_inicio, settlement.anio_inicio) }} ({{ settlement.anio_inicio }})</span>
        <div class="text-gray-600">Agente: {{ settlement.agente }}</div>
      </div>
      <div class="text-right md:text-left">
        <div class="text-gray-600">
          <span class="text-gray-500">Semanas transcurridas:</span>
          <span class="font-medium">{{ settlement.semanas_transcurridas }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ISpecialSettlement } from '../types'
import CardContainer from '@/shared/components/CardContainer.vue';

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