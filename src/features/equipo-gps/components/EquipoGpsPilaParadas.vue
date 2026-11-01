<script setup lang="ts">
// Varias paradas en el mismo lugar (la oficina): un solo marcador, el círculo de la que va encima, una hoja detrás y
// «×N». Tocarlo abre un globo con una fila de texto por parada; tocar una fila la selecciona, como el navegador.
import { computed } from 'vue'
import { LIcon, LMarker, LPopup, LTooltip } from '@vue-leaflet/vue-leaflet'
import { formatDuration, formatTime, STOP_PX, stopSize } from '../equipo-gps.helpers'
import type { PilaParadas, RecorridoHoy } from '../equipo-gps.types'

const props = defineProps<{
  paradas: RecorridoHoy['paradas']
  pila: PilaParadas
  color: string
  /** La parada de encima es la seleccionada: va en el pane `paradaActiva` con su etiqueta fija. */
  seleccionada: boolean
  /** De qué lado cae la etiqueta (cerca del borde derecho, a la izquierda). */
  lado: 'left' | 'right'
}>()
const emit = defineEmits<{ (e: 'elegir', index: number): void }>()

const encima = computed(() => props.paradas[props.pila.encima])
const tam = computed(() => STOP_PX[stopSize(encima.value.segundos)])
const pane = computed(() => (props.seleccionada ? 'paradaActiva' : 'markerPane'))
const fila = (index: number) => `${index + 1} · ${formatTime(props.paradas[index].inicio)} · ${formatDuration(props.paradas[index].segundos)}`
</script>

<template>
  <LMarker
    :key="`pila-${pila.indices[0]}-${pane}`"
    :lat-lng="[encima.lat, encima.lon]"
    :pane="pane"
    :z-index-offset="500"
    :options="{ bubblingMouseEvents: false }"
  >
    <LIcon :icon-size="[tam + 3, tam + 3]" :icon-anchor="[tam / 2, tam / 2]" class-name="equipo-gps-parada">
      <span class="equipo-gps-pila" :style="{ width: `${tam}px`, height: `${tam}px` }">
        <span class="equipo-gps-pila__hoja" :style="{ borderColor: color }" />
        <span class="equipo-gps-parada__punto" :data-size="stopSize(encima.segundos)" :data-selected="seleccionada" :style="{ borderColor: color }">{{ pila.encima + 1 }}</span>
        <span class="equipo-gps-pila__n" :style="{ background: color }">×{{ pila.indices.length }}</span>
      </span>
    </LIcon>
    <LTooltip
      v-if="seleccionada"
      :key="`pila-fija-${lado}`"
      :options="{ permanent: true, direction: lado, offset: [(lado === 'left' ? -1 : 1) * (tam / 2 + 2), 0], className: 'equipo-gps-label', pane: 'paradaActiva' }"
    >
      Parada {{ pila.encima + 1 }} · {{ formatTime(encima.inicio) }} · {{ formatDuration(encima.segundos) }}
    </LTooltip>
    <LPopup :options="{ className: 'equipo-gps-pila-globo', closeButton: false, offset: [0, -tam / 2], minWidth: 0 }">
      <button v-for="index in pila.indices" :key="index" type="button" class="block h-11 w-full px-3 text-left text-[13px] tabular-nums text-slate-900 active:bg-slate-50" @click="emit('elegir', index)">
        {{ fila(index) }}
      </button>
    </LPopup>
  </LMarker>
</template>
