<script setup lang="ts">
import type { INoPago, IVisita } from '../types'
import { computed } from 'vue'
import { latLng, type LatLng } from 'leaflet'
import { formatToHumanDate, toCurrency } from '@/shared/utils'

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import MapIcon from '@/shared/components/icons/MapIcon.vue'

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */

interface Emit {
  (e: 'click:map-market', v: LatLng): void
  (e: 'click:visit-selected', v: IVisita): void
}

const $emit = defineEmits<Emit>()

const $props = defineProps<{
  pago: INoPago
}>()

const tieneVisitas = computed(() => $props.pago.visitas.length > 0)

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */

function onVisitClick(visita: IVisita) {
  $emit('click:map-market', latLng(visita.lat ?? 0, visita.lng ?? 0))
  $emit('click:visit-selected', visita)
}
</script>

<template>
  <div class="space-y-2 p-2">
    <div class="space-y-2 rounded-lg border bg-white p-4">
      <div>
        <h2 class="title">{{ pago.cliente }}</h2>
        <p class="subtitle mb-4">
          Identificador
          <span class="font-semibold text-blue-800">
            {{ pago.pagoId }}
          </span>
        </p>
      </div>

      <!-- Semana -->
      <div class="flex justify-between gap-2">
        <p class="font-300 text-gray-400">Prestamo</p>
        <p class="font-md-700 text-blue-800">{{ pago.prestamoId }}</p>
      </div>
      <!-- / Semana -->

      <!-- Semana -->
      <div class="flex justify-between gap-2">
        <p class="font-300 text-gray-400">Gerencia</p>
        <p class="font-md-700 text-blue-800">{{ pago.gerencia }}</p>
      </div>
      <!-- / Semana -->

      <!-- Semana -->
      <div class="flex justify-between gap-2">
        <p class="font-300 text-gray-400">Agencia</p>
        <p class="font-md-700 text-blue-800">{{ pago.agente }}</p>
      </div>
      <!-- / Semana -->

      <!-- Semana -->
      <div class="flex justify-between gap-2">
        <p class="font-300 text-gray-400">Semana</p>
        <p class="font-md-700 text-blue-800">{{ pago.semana }} - {{ pago.anio }}</p>
      </div>
      <!-- / Semana -->

      <!-- Semana -->
      <div class="flex justify-between gap-2">
        <p class="font-300 text-gray-400">Tarifa</p>
        <p class="font-md-700 text-blue-800">{{ toCurrency(pago.tarifa) }}</p>
      </div>
      <!-- / Semana -->

      <!-- Semana -->
      <div class="flex justify-between gap-2">
        <p class="font-300 text-gray-400">Fecha Pago</p>
        <p class="font-md-700 text-blue-800">{{ formatToHumanDate(pago.fechaPago, true) }}</p>
      </div>
      <!-- / Semana -->

      <hr class="line" />

      <div v-if="tieneVisitas" class="flex flex-wrap justify-center gap-3" role="group">
        <span
          class="inline-flex items-center space-x-1 rounded border border-blue-400 bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-gray-700 dark:text-blue-400"
          v-for="visita in pago.visitas"
          @click="onVisitClick(visita)"
          :key="visita.prestamoId"
        >
          <MapIcon class="h-3 w-3" />
          <p>Visita</p>
        </span>
      </div>

      <div v-else>
        <span class="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-500">
          Sin visitas para este no pago
        </span>
      </div>
    </div>
  </div>
</template>
