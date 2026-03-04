<script setup lang="ts">
import { FileCheck, Eye } from 'lucide-vue-next'
import { toCurrency } from '@/shared/utils'
import type { SoliFilterListItem } from '../types/soliFilter.types'

// Components
import CardContainer from '@/shared/components/CardContainer.vue'
import DataField from '@/shared/components/DataField.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

defineProps<{
  solicitud: SoliFilterListItem
}>()

defineEmits<{
  'action:show-details': [solicitud: SoliFilterListItem]
}>()
</script>

<template>
  <CardContainer>
    <div class="flex items-center gap-2 mb-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
        <FileCheck :size="16" :stroke-width="2" class="text-blue-500" />
      </div>
      <span class="text-sm font-semibold text-slate-700">Solicitud #{{ solicitud.id }}</span>
      <span
        :class="[
          'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold',
          solicitud.status === 'pendiente'
            ? 'bg-amber-50 text-amber-600'
            : 'bg-emerald-50 text-emerald-600',
        ]"
      >
        {{ solicitud.status }}
      </span>
    </div>

    <DataField label="Cliente" :value="solicitud.nombre_cliente" />
    <DataField label="Aval" :value="solicitud.nombre_aval" />
    <DataField label="Monto" :value="toCurrency(solicitud.monto_solicitado)" />
    <DataField label="Tipo" :value="solicitud.tipo_credito" />

    <BtnComponent variant="primary" size="sm" full-width @click="$emit('action:show-details', solicitud)">
      <template #icon-left>
        <Eye class="size-4" />
      </template>
      Ver detalles
    </BtnComponent>
  </CardContainer>
</template>
