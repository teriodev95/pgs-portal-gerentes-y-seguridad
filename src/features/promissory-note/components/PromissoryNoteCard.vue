<script setup lang="ts">
/**
 * Un pagare de la lista del gerente. La tarjeta entera es tocable, como el resto
 * de las listas de la PWA.
 *
 * Manda el domicilio a primer nivel y deja fuera monto, cargo y plazo: lo que el
 * gerente decide con esta tarjeta es a donde va, no cuanto presto el cliente.
 */
import CardContainer from '@/shared/components/CardContainer.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import AngleRight from '@/shared/components/icons/AngleRight.vue'
import CheckCircleIcon from '@/shared/components/icons/CheckCircleIcon.vue'
import type { PagarePendiente } from '../types'

interface Props {
  pagare: PagarePendiente
  /** Cuantos pagares hay a este mismo nombre. Con mas de uno, se avisa. */
  mismoNombre?: number
}

const props = withDefaults(defineProps<Props>(), { mismoNombre: 1 })

const emit = defineEmits<{ click: [pagare: PagarePendiente] }>()

const registrado = !!props.pagare.nombre_quien_recibio?.trim()

const liquidacion =
  props.pagare.semana_liquidacion && props.pagare.anio_liquidacion
    ? `S${props.pagare.semana_liquidacion}/${props.pagare.anio_liquidacion}`
    : null
</script>

<template>
  <CardContainer
    class-name="cursor-pointer space-y-2 transition-shadow hover:shadow-md"
    @click="emit('click', pagare)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 space-y-1">
        <div class="flex items-center gap-1.5">
          <CheckCircleIcon v-if="registrado" class="h-4 w-4 text-green-600" />
          <TextCT variant="title" class="truncate">
            {{ pagare.cliente_nombre || 'Sin nombre' }}
          </TextCT>
        </div>

        <TextCT variant="secondary" v-if="pagare.cliente_domicilio">
          {{ pagare.cliente_domicilio }}
        </TextCT>
      </div>

      <AngleRight class="mt-1 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
    </div>

    <!-- El aviso vive en la tarjeta donde se comete el error, no en un banner
         arriba que se lee una vez y se olvida al tercer cliente. -->
    <span
      v-if="mismoNombre > 1"
      class="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700"
    >
      {{ mismoNombre }} pagarés a este nombre
    </span>

    <TextCT variant="tertiary">
      <template v-if="pagare.folio">Folio {{ pagare.folio }}</template>
      <template v-if="pagare.folio && liquidacion"> · </template>
      <template v-if="liquidacion">{{ liquidacion }}</template>
    </TextCT>

    <TextCT variant="tertiary" v-if="registrado" class="text-green-700">
      Recibió: {{ pagare.nombre_quien_recibio }}
      <template v-if="pagare.fecha_entrega_pagare"> · {{ pagare.fecha_entrega_pagare }}</template>
    </TextCT>
  </CardContainer>
</template>
