<script setup lang="ts">
import CardContainer from '@/shared/components/CardContainer.vue'
import type { Pagare } from '../types'
import TextCT from '@/shared/components/ui/TextCT.vue';
import DataField from '@/shared/components/DataField.vue';

defineProps<{
  pagare: Pagare
}>()

const emit = defineEmits<{
  click: [pagare: Pagare]
}>()
</script>

<template>
  <CardContainer class="cursor-pointer hover:shadow-md transition-shadow" @click="emit('click', pagare)">
    <TextCT variant="title">
      {{ pagare.cliente_nombre }}
    </TextCT>

    <div class="flex justify-between items-start mb-2">
      <TextCT variant="tertiary">
        {{  pagare.id_sistemas }}
      </TextCT>
      <TextCT as="span" v-if="pagare.semaforo" variant="tertiary" >
        {{ pagare.semaforo }}
      </TextCT>
    </div>

    <div class="grid grid-cols-2 gap-2 justify-between text-sm">
      <DataField orientation="vertical" label="Id" :value="pagare.id_sistemas" />
      <DataField class="justify-self-end text-right" orientation="vertical" label="Préstamo" :value="pagare.prestamo_id" />
      <DataField orientation="vertical" label="Agencia" :value="pagare.agencia" />
      <DataField class="justify-self-end" orientation="vertical" label="Monto" :value="`$${pagare.monto_prestamo.toLocaleString()}`" />
      <DataField orientation="vertical" label="Total a pagar" :value="`$${pagare.total_a_pagar.toLocaleString()}`" />
    </div>
  </CardContainer>
</template>
