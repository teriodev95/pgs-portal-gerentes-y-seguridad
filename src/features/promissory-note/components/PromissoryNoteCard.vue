<script setup lang="ts">
/**
 * Un pagare de la lista del gerente, con el vocabulario visual de Solim: tarjeta
 * de borde suave, franja de estado a la izquierda y el dato duro en una sola
 * linea de meta.
 *
 * El domicilio va a primer nivel y quedan fuera monto, cargo y plazo: lo que se
 * decide con esta tarjeta es a donde ir, no cuanto presto el cliente.
 */
import { computed } from 'vue'
import { ChevronRight, MapPin, TriangleAlert } from 'lucide-vue-next'
import type { PagarePendiente } from '../types'

interface Props {
  pagare: PagarePendiente
  /** Cuantos pagares hay a este mismo nombre. Con mas de uno, se avisa. */
  mismoNombre?: number
}

const props = withDefaults(defineProps<Props>(), { mismoNombre: 1 })

const emit = defineEmits<{ click: [pagare: PagarePendiente] }>()

const registrado = computed(() => !!props.pagare.nombre_quien_recibio?.trim())

const liquidacion = computed(() =>
  props.pagare.semana_liquidacion && props.pagare.anio_liquidacion
    ? `S${props.pagare.semana_liquidacion}/${props.pagare.anio_liquidacion}`
    : null
)
</script>

<template>
  <article class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <!-- La franja dice el estado antes de leer una palabra, igual que en Solim. -->
    <div
      class="absolute inset-y-0 left-0 w-1"
      :class="registrado ? 'bg-emerald-500' : 'bg-blue-600'"
      aria-hidden="true"
    />

    <button
      type="button"
      class="flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-slate-50/60"
      @click="emit('click', pagare)"
    >
      <div class="min-w-0 flex-1 space-y-1.5">
        <!-- Sin `truncate`: el nombre es justo lo que se coteja contra el talon,
             y "MARIA DEL REFUGIO VICTORIA DE LA CRUZ ANSEL..." no se coteja. -->
        <p class="text-[15px] font-semibold leading-snug text-slate-900">
          {{ pagare.cliente_nombre || 'Sin nombre' }}
        </p>

        <p
          v-if="pagare.cliente_domicilio"
          class="flex items-start gap-1.5 text-[12px] leading-snug text-slate-500"
        >
          <MapPin class="mt-0.5 size-3.5 shrink-0 text-slate-400" />
          <span class="line-clamp-2">{{ pagare.cliente_domicilio }}</span>
        </p>

        <div class="flex flex-wrap items-center gap-1.5 text-[12px] text-slate-500">
          <span v-if="pagare.folio" class="font-medium text-slate-700">{{ pagare.folio }}</span>
          <span v-if="pagare.folio && liquidacion" class="text-slate-300">·</span>
          <span v-if="liquidacion" class="tabular-nums">{{ liquidacion }}</span>
        </div>

        <!-- El aviso vive en la tarjeta donde se comete el error, no en un banner
             arriba que se lee una vez y se olvida al tercer cliente. -->
        <p
          v-if="mismoNombre > 1"
          class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
        >
          <TriangleAlert class="size-3" />
          {{ mismoNombre }} pagarés a este nombre
        </p>

        <p v-if="registrado" class="truncate text-[12px] text-emerald-700">
          Recibió {{ pagare.nombre_quien_recibio }}
          <span v-if="pagare.fecha_entrega_pagare" class="text-emerald-600/70">
            · {{ pagare.fecha_entrega_pagare }}
          </span>
        </p>
      </div>

      <ChevronRight class="size-5 shrink-0 text-slate-400" />
    </button>
  </article>
</template>
