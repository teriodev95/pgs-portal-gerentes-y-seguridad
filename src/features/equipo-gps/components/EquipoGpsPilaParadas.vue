<script setup lang="ts">
// Varias paradas en el mismo lugar (la oficina): un solo marcador, el círculo de la que va encima, una hoja detrás y
// «×N». Tocarlo abre un globo con una fila de texto por parada; tocar una fila la selecciona, como el navegador.
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { LIcon, LMarker, LPopup, LTooltip } from '@vue-leaflet/vue-leaflet'
import { formatDuration, formatTime, STOP_PX, stopSize } from '../equipo-gps.helpers'
import type { PilaParadas, RecorridoHoy } from '../equipo-gps.types'

const props = defineProps<{
  paradas: RecorridoHoy['paradas']
  pila: PilaParadas
  color: string
  /** La parada de encima es la seleccionada: va en el pane `paradaActiva` con su etiqueta fija. */
  seleccionada: boolean
  /** Índice de la parada seleccionada en el día (su fila del globo va en azul suave), o null. */
  paradaSeleccionada: number | null
  /** De qué lado cae la etiqueta (cerca del borde derecho, a la izquierda). */
  lado: 'left' | 'right'
}>()
const emit = defineEmits<{ (e: 'elegir', index: number): void }>()

const encima = computed(() => props.paradas[props.pila.encima])
const tam = computed(() => STOP_PX[stopSize(encima.value.segundos)])
const pane = computed(() => (props.seleccionada ? 'paradaActiva' : 'markerPane'))
const rango = (index: number) => `${formatTime(props.paradas[index].inicio)} – ${formatTime(props.paradas[index].fin)}`
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
    <!-- Globo: «2 paradas aquí» y una fila por parada que se ve tocable: su circulito, el rango de horas, la duración y ›. -->
    <LPopup :options="{ className: 'equipo-gps-pila-globo', closeButton: false, offset: [0, -tam / 2], minWidth: 0 }">
      <p class="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">{{ pila.indices.length }} paradas aquí</p>
      <ul class="divide-y divide-slate-100">
        <li v-for="index in pila.indices" :key="index">
          <button
            type="button"
            class="flex h-11 w-full items-center gap-3 px-3 text-left active:bg-slate-100"
            :class="paradaSeleccionada === index ? 'bg-[#eff6ff]' : ''"
            :aria-current="paradaSeleccionada === index ? 'true' : undefined"
            @click="emit('elegir', index)"
          >
            <span class="equipo-gps-parada__punto" :style="{ borderColor: color }">{{ index + 1 }}</span>
            <span class="min-w-0 flex-1 truncate text-[14px] tabular-nums leading-5 text-slate-900">{{ rango(index) }} <span class="text-[13px] text-slate-500">· {{ formatDuration(paradas[index].segundos) }}</span></span>
            <ChevronRight class="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </LPopup>
  </LMarker>
</template>
