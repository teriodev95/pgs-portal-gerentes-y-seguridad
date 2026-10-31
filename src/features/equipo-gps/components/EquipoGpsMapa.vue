<script setup lang="ts">
// Único componente del detalle que importa Leaflet: entra al chunk perezoso que ya existe para MapWidget.
import { computed, ref, watch } from 'vue'
import { latLngBounds, type Map as LeafletMap, type PointExpression } from 'leaflet'
import { LCircleMarker, LIcon, LMarker, LPolyline, LTooltip } from '@vue-leaflet/vue-leaflet'
import MapWidget from '@/shared/components/MapWidget.vue'
import { EQUIPO_GPS_COLOR } from '../equipo-gps.constants'
import {
  formatDuration, formatTime, gapLinks, longestStops, paradasVisibles, routeBands, routeEnds, shade, STOP_PX, stopSize
} from '../equipo-gps.helpers'
import type { RecorridoHoy, UbicacionGerente } from '../equipo-gps.types'

const props = defineProps<{
  ubicacion: UbicacionGerente | null
  recorrido: RecorridoHoy | null
  /** La persona sigue en movimiento: el marcador cierra la ruta como «Último punto», no «Fin». */
  enVivo: boolean
  /** Alto (px) que el panel inferior tapa: el encuadre deja la ruta en la parte visible. */
  margenInferior?: number
  /** Color de la persona (borde de las paradas); por defecto el azul de acción. */
  color?: string
  /** Parada resaltada (índice), compartida con la línea del día. */
  paradaSeleccionada?: number | null
  /** «Solo paradas»: sin líneas sólidas ni estimadas; quedan paradas, Inicio y último punto. */
  soloParadas?: boolean
  /** Modo «En vivo»: estela de los últimos minutos y pulso del marcador (sólo con señal fresca). */
  estela?: [number, number, string][] | null
  pulsa?: boolean
}>()
const emit = defineEmits<{ (e: 'parada', index: number): void; (e: 'arrastre'): void }>()

const BANDS = 12
const mapa = ref<LeafletMap>()
const zoom = ref(15)
// Cambia con cada movimiento: las etiquetas que tocarían el borde derecho se voltean a la izquierda.
const vista = ref(0)
const reducido = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const colorPersona = computed(() => props.color ?? EQUIPO_GPS_COLOR)

// Paradas: punto blanco numerado con borde del color de la persona, tres tamaños por duración (como MOX);
// sólo las dos más largas llevan su duración fija; si dos se enciman en este zoom, sólo la más larga.
const paradas = computed(() => props.recorrido?.paradas ?? [])
const masLargas = computed(() => longestStops(paradas.value))
const visibles = computed(() => paradasVisibles(paradas.value, zoom.value))

// Puebla por defecto cuando aún no hay dónde centrar; `encuadrar` manda en cuanto hay datos.
const centro = computed<PointExpression>(() =>
  props.ubicacion ? [props.ubicacion.lat, props.ubicacion.lon] : [19.0414, -98.2063]
)

// Degradado inicio → fin como MOX: 12 polilíneas de clara a oscura según la distancia del día.
const bandas = computed(() => (props.recorrido ? routeBands(props.recorrido.tramos, BANDS) : []))
const huecos = computed(() => (props.recorrido ? gapLinks(props.recorrido) : []))
const extremos = computed(() => (props.recorrido ? routeEnds(props.recorrido.tramos) : null))

// Sólo dos etiquetas en el mapa: «Inicio HH:MM» y «Fin HH:MM» (o «Último punto»). Los huecos van
// punteados y tenues, sin rótulo: su duración se lee en la línea del día del panel.
const etiquetaInicio = computed(() => (extremos.value ? `Inicio ${formatTime(extremos.value.start[2])}` : ''))
const etiquetaFin = computed(() => {
  const hora = formatTime(props.ubicacion?.registrado_at ?? extremos.value?.end[2] ?? '')
  return `${props.enVivo ? 'Último punto' : 'Fin'} ${hora}`
})
// Si el último punto y el inicio caen en el mismo sitio, la etiqueta de inicio cede para no encimarse.
const inicioSeparado = computed(() => {
  if (!extremos.value || !props.ubicacion) return true
  const [lat, lon] = extremos.value.start
  return Math.hypot(lat - props.ubicacion.lat, lon - props.ubicacion.lon) > 0.0006
})

function encuadrarPuntos(puntos: [number, number][]) {
  const map = mapa.value
  if (!map) return
  map.invalidateSize()
  const abajo = (props.margenInferior ?? 0) + 80
  if (puntos.length > 1)
    map.fitBounds(latLngBounds(puntos), { paddingTopLeft: [24, 120], paddingBottomRight: [24, abajo], maxZoom: 16, animate: !reducido })
  else if (puntos.length === 1) map.setView(puntos[0], 15, { animate: !reducido })
}

function encuadrar() {
  const puntos = props.soloParadas ? [] : bandas.value.flatMap((banda) => banda.points)
  if (props.soloParadas) puntos.push(...paradas.value.map((p) => [p.lat, p.lon] as [number, number]), ...(extremos.value ? [[extremos.value.start[0], extremos.value.start[1]] as [number, number]] : []))
  if (props.ubicacion) puntos.push([props.ubicacion.lat, props.ubicacion.lon])
  encuadrarPuntos(puntos)
}

/** Vuela a un lugar con zoom cómodo; con «movimiento reducido» salta directo. */
function centrar(lugar: [number, number], zoom = 16) {
  const map = mapa.value
  if (!map) return
  // El panel tapa la parte inferior: el punto se deja arriba del panel, no detrás.
  const offset = (props.margenInferior ?? 0) / 2
  const target = map.project(lugar, zoom).add([0, offset])
  const destino = map.unproject(target, zoom)
  if (reducido) map.setView(destino, zoom, { animate: false })
  else map.flyTo(destino, zoom, { duration: 0.6 })
}

/** Dirección de una etiqueta fija según dónde cae en pantalla: cerca del borde derecho, a la izquierda. */
function direccion(lat: number, lon: number): 'top' | 'left' | 'right' {
  void vista.value
  const map = mapa.value
  if (!map) return 'top'
  const size = map.getSize()
  const p = map.latLngToContainerPoint([lat, lon])
  if (p.x > size.x - 120) return 'left'
  if (p.x < 120) return 'right'
  return 'top'
}

function onReady(map: LeafletMap) {
  mapa.value = map
  zoom.value = map.getZoom()
  map.on('zoomend', () => (zoom.value = map.getZoom()))
  map.on('moveend zoomend resize', () => (vista.value += 1))
  // Mover el mapa con el dedo pausa el seguimiento en vivo (convención de Google Maps).
  map.on('dragstart', () => emit('arrastre'))
  encuadrar()
}

/** Seguir en vivo: desplaza al lugar sin cambiar el zoom del usuario. */
function seguir(lugar: [number, number]) {
  const map = mapa.value
  if (!map) return
  const offset = (props.margenInferior ?? 0) / 2
  const zoomActual = map.getZoom()
  const target = map.project(lugar, zoomActual).add([0, offset])
  map.panTo(map.unproject(target, zoomActual), { animate: !reducido, duration: 0.5 })
}

watch(bandas, encuadrar)
watch(() => props.soloParadas, encuadrar)
defineExpose({ encuadrar, centrar, seguir })
</script>

<template>
  <MapWidget
    :center="centro"
    :zoom="15"
    :max-zoom="17"
    :options="{ preferCanvas: true, zoomControl: false, attributionControl: false }"
    height-class="h-full"
    no-remount
    readonly
    @ready="onReady"
  >
    <LPolyline
      v-for="(hueco, index) in soloParadas ? [] : huecos"
      :key="`hueco-${index}`"
      :lat-lngs="[hueco.from, hueco.to]"
      :color="'#94a3b8'"
      :weight="2"
      :opacity="0.7"
      :dash-array="'2 6'"
      :interactive="false"
    />

    <!-- Tramos medidos: línea sólida. Tramos estimados (sin puntos en medio): delgada y punteada, mismo color,
         y al tocarla dice cuánto tiempo estuvo sin puntos. Igual que en MOX. -->
    <LPolyline
      v-for="(banda, index) in soloParadas ? [] : bandas"
      :key="`banda-${index}`"
      :lat-lngs="banda.points"
      :color="shade(EQUIPO_GPS_COLOR, banda.band / (BANDS - 1))"
      :weight="banda.estimated ? 3 : 5"
      :opacity="1"
      :dash-array="banda.estimated ? '4 8' : undefined"
      :line-cap="'round'"
      :line-join="'round'"
      :interactive="banda.estimated"
    >
      <LTooltip v-if="banda.estimated" :options="{ direction: 'top', className: 'equipo-gps-label' }">
        Tramo estimado · sin puntos {{ formatDuration(banda.seconds) }}
      </LTooltip>
    </LPolyline>

    <LMarker
      v-for="index in visibles"
      :key="`parada-${index}`"
      :lat-lng="[paradas[index].lat, paradas[index].lon]"
      :z-index-offset="paradaSeleccionada === index ? 900 : 500"
      @click="emit('parada', index)"
    >
      <LIcon
        :icon-size="[STOP_PX[stopSize(paradas[index].segundos)], STOP_PX[stopSize(paradas[index].segundos)]]"
        :icon-anchor="[STOP_PX[stopSize(paradas[index].segundos)] / 2, STOP_PX[stopSize(paradas[index].segundos)] / 2]"
        class-name="equipo-gps-parada"
      >
        <span
          class="equipo-gps-parada__punto"
          :data-size="stopSize(paradas[index].segundos)"
          :data-selected="paradaSeleccionada === index"
          :style="{ borderColor: colorPersona }"
        >{{ index + 1 }}</span>
      </LIcon>
      <LTooltip
        :key="`${paradaSeleccionada === index ? 'fija' : masLargas.includes(index) ? 'larga' : 'toque'}-${direccion(paradas[index].lat, paradas[index].lon) === 'left' ? 'izq' : 'der'}`"
        :options="{
          permanent: paradaSeleccionada === index || masLargas.includes(index),
          direction: direccion(paradas[index].lat, paradas[index].lon) === 'left' ? 'left' : 'right',
          offset: [(direccion(paradas[index].lat, paradas[index].lon) === 'left' ? -1 : 1) * (STOP_PX[stopSize(paradas[index].segundos)] / 2 + 2), 0],
          className: paradaSeleccionada === index ? 'equipo-gps-label' : 'equipo-gps-parada-label'
        }"
      >
        <template v-if="paradaSeleccionada === index">
          Parada {{ index + 1 }} · {{ formatTime(paradas[index].inicio) }} · {{ formatDuration(paradas[index].segundos) }}
        </template>
        <template v-else-if="masLargas.includes(index)">{{ formatDuration(paradas[index].segundos) }}</template>
        <template v-else>{{ formatTime(paradas[index].inicio) }} · {{ formatDuration(paradas[index].segundos) }}</template>
      </LTooltip>
    </LMarker>

    <LCircleMarker
      v-if="extremos"
      :lat-lng="[extremos.start[0], extremos.start[1]]"
      :radius="6"
      :color="'#ffffff'"
      :fill-color="shade(EQUIPO_GPS_COLOR, 0)"
      :fill-opacity="1"
      :weight="2"
    >
      <LTooltip
        v-if="inicioSeparado"
        :key="`inicio-${direccion(extremos.start[0], extremos.start[1])}`"
        :options="{ permanent: true, direction: direccion(extremos.start[0], extremos.start[1]), offset: direccion(extremos.start[0], extremos.start[1]) === 'top' ? [0, -6] : [direccion(extremos.start[0], extremos.start[1]) === 'left' ? -8 : 8, 0], className: 'equipo-gps-label' }"
      >
        {{ etiquetaInicio }}
      </LTooltip>
    </LCircleMarker>

    <!-- Estela en vivo: los últimos minutos, delgada, en el color de la persona. -->
    <LPolyline
      v-if="estela && estela.length > 1"
      :lat-lngs="estela.map((v) => [v[0], v[1]])"
      :color="colorPersona"
      :weight="3"
      :opacity="0.9"
      :line-cap="'round'"
      :line-join="'round'"
      :interactive="false"
    />
    <LCircleMarker
      v-if="ubicacion && pulsa"
      :lat-lng="[ubicacion.lat, ubicacion.lon]"
      :radius="18"
      :stroke="false"
      :fill-color="EQUIPO_GPS_COLOR"
      :fill-opacity="0.18"
      :interactive="false"
      :class-name="'equipo-gps-pulso'"
    />
    <LCircleMarker
      v-if="ubicacion"
      :lat-lng="[ubicacion.lat, ubicacion.lon]"
      :radius="8"
      :color="'#ffffff'"
      :fill-color="EQUIPO_GPS_COLOR"
      :fill-opacity="1"
      :weight="3"
    >
      <LTooltip
        :key="`fin-${direccion(ubicacion.lat, ubicacion.lon)}`"
        :options="{ permanent: true, direction: direccion(ubicacion.lat, ubicacion.lon), offset: direccion(ubicacion.lat, ubicacion.lon) === 'top' ? [0, -8] : [direccion(ubicacion.lat, ubicacion.lon) === 'left' ? -10 : 10, 0], className: 'equipo-gps-label' }"
      >
        {{ etiquetaFin }}
      </LTooltip>
    </LCircleMarker>
  </MapWidget>
</template>

<style>
/* Etiquetas informativas del mapa («Inicio 09:16»): sin sombra, no parecen botones (Norman). */
.leaflet-tooltip.equipo-gps-label {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 8px;
  box-shadow: none;
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
}
/* Pulso suave del punto en vivo (canvas: se anima la opacidad del contenedor por clase). */
@keyframes equipo-gps-pulso {
  0% { opacity: 0.9; }
  50% { opacity: 0.25; }
  100% { opacity: 0.9; }
}
.equipo-gps-pulso {
  animation: equipo-gps-pulso 1.6s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .equipo-gps-pulso {
    animation: none;
  }
}
.leaflet-tooltip.equipo-gps-label::before {
  display: none;
}
/* Paradas: sutiles, en blanco con borde del color de la persona; el número coincide con la línea del día. */
.equipo-gps-parada {
  background: transparent;
  border: 0;
}
.equipo-gps-parada__punto {
  align-items: center;
  background: #ffffff;
  border: 2px solid;
  border-radius: 9999px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.2);
  box-sizing: border-box;
  color: #0f172a;
  display: flex;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  height: 100%;
  justify-content: center;
  width: 100%;
}
.equipo-gps-parada__punto[data-size='1'] {
  font-size: 11px;
}
.equipo-gps-parada__punto[data-size='2'] {
  border-width: 3px;
  font-size: 12px;
}
.equipo-gps-parada__punto[data-selected='true'] {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}
.leaflet-tooltip.equipo-gps-parada-label {
  background: rgba(255, 255, 255, 0.92);
  border: 0;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.14);
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
}
.leaflet-tooltip.equipo-gps-parada-label::before {
  display: none;
}
</style>
