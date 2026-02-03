<script setup lang="ts">
import DataField from '@/shared/components/DataField.vue'
import type { Liquidacion } from '../types'
import CardContainer from '@/shared/components/CardContainer.vue';

interface Props {
  settlement: Liquidacion
}

defineProps<Props>()
</script>

<template>
    <CardContainer>
      <DataField label="Cliente" :value="settlement.cliente" />
      <DataField label="Identificador" :value="settlement.identificador" />
      <DataField label="Sem. Entregada" :value="settlement.semEntrega" />
    </CardContainer>
</template>