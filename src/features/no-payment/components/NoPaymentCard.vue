<script setup lang="ts">
import type { INoPago, IVisita } from '../types'
import { computed } from 'vue'
import { latLng, type LatLng } from 'leaflet'
import { formatToHumanDate, toCurrency } from '@/shared/utils'

// Components
import MapIcon from '@/shared/components/icons/MapIcon.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import DataField from '@/shared/components/DataField.vue'

// Props & Emits 
interface Emit {
  (e: 'click:map-market', v: LatLng): void
  (e: 'click:visit-selected', v: IVisita): void
}

const $emit = defineEmits<Emit>()

const $props = defineProps<{
  pago: INoPago
}>()

// Data & Computed
const tieneVisitas = computed(() => $props.pago.visitas.length > 0)

// Methods  
function onVisitClick(visita: IVisita) {
  $emit('click:map-market', latLng(visita.lat ?? 0, visita.lng ?? 0))
  $emit('click:visit-selected', visita)
}
</script>

<template>
  <CardContainer :title="pago.cliente">
    <TextCT variant="tertiary">id: {{ pago.pagoId }}</TextCT>
    <DataField label="Préstamo" :value="pago.prestamoId"/>
    <DataField label="Agencia" :value="pago.agente"/>
    <DataField label="Semana" :value="`${pago.semana} - ${pago.anio}`"/>
    <DataField label="Tarifa" :value="toCurrency(pago.tarifa)"/>
    <DataField label="Fecha Pago" right-aligned :value="formatToHumanDate(pago.fechaPago, true)"/>

    <hr class="line" />

    <div v-if="tieneVisitas" class="flex flex-wrap justify-center gap-3" role="group">
      <span
        class="inline-flex items-center space-x-1 rounded border border-blue-400 bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-gray-700 dark:text-blue-400"
        v-for="visita in pago.visitas" @click="onVisitClick(visita)" :key="visita.prestamoId">
        <MapIcon class="h-3 w-3" />
        <p>Visita</p>
      </span>
    </div>

    <div v-else>
      <span class="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-500">
        Sin visitas para este no pago
      </span>
    </div>
  </CardContainer>
</template>
