<script setup lang="ts">
// Único componente del detalle que importa Leaflet: entra al chunk perezoso que ya existe para MapWidget.
import { computed, ref, watch } from 'vue'
import { latLngBounds, type Map as LeafletMap, type PointExpression } from 'leaflet'
import { LCircleMarker, LPolyline, LTooltip } from '@vue-leaflet/vue-leaflet'
import MapWidget from '@/shared/components/MapWidget.vue'
import { EQUIPO_GPS_COLOR } from '../equipo-gps.constants'
import { formatDuration, formatTime, gapLinks, routeBands, routeEnds, shade } from '../equipo-gps.helpers'
import type { RecorridoHoy, UbicacionGerente } from '../equipo-gps.types'

const props = defineProps<{
  ubicacion: UbicacionGerente | null
  recorrido: RecorridoHoy | null
  /** La persona sigue en movimiento: el marcador cierra la ruta como «Último punto», no «Fin». */
  enVivo: boolean
  /** Alto (px) que el panel inferior tapa: el encuadre deja la ruta en la parte visible. */
  margenInferior?: number
}>()

const BANDS = 12
const mapa = ref<LeafletMap>()

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

function encuadrar() {
  const map = mapa.value
  if (!map) return
  map.invalidateSize()
  const puntos = bandas.value.flatMap((banda) => banda.points)
  if (props.ubicacion) puntos.push([props.ubicacion.lat, props.ubicacion.lon])
  const abajo = (props.margenInferior ?? 0) + 24
  if (puntos.length > 1)
    map.fitBounds(latLngBounds(puntos), { paddingTopLeft: [24, 72], paddingBottomRight: [24, abajo], maxZoom: 16 })
  else if (puntos.length === 1) map.setView(puntos[0], 15)
}

function centrar(lugar: [number, number], zoom = 16) {
  const map = mapa.value
  if (!map) return
  // El panel tapa la mitad inferior: el punto se deja arriba del panel, no detrás.
  const offset = (props.margenInferior ?? 0) / 2
  const target = map.project(lugar, zoom).add([0, offset])
  map.setView(map.unproject(target, zoom), zoom, { animate: true })
}

function onReady(map: LeafletMap) {
  mapa.value = map
  encuadrar()
}

watch(bandas, encuadrar)
defineExpose({ encuadrar, centrar })
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
      v-for="(hueco, index) in huecos"
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
      v-for="(banda, index) in bandas"
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
        :options="{ permanent: true, direction: 'top', offset: [0, -6], className: 'equipo-gps-label' }"
      >
        {{ etiquetaInicio }}
      </LTooltip>
    </LCircleMarker>

    <LCircleMarker
      v-if="ubicacion"
      :lat-lng="[ubicacion.lat, ubicacion.lon]"
      :radius="8"
      :color="'#ffffff'"
      :fill-color="EQUIPO_GPS_COLOR"
      :fill-opacity="1"
      :weight="3"
    >
      <LTooltip :options="{ permanent: true, direction: 'top', offset: [0, -8], className: 'equipo-gps-label' }">
        {{ etiquetaFin }}
      </LTooltip>
    </LCircleMarker>
  </MapWidget>
</template>

<style>
/* Etiquetas del mapa: una sola superficie blanca, esquinas de 8, texto 13. */
.leaflet-tooltip.equipo-gps-label {
  background: #ffffff;
  border: 0;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.16);
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
}
.leaflet-tooltip.equipo-gps-label::before {
  display: none;
}
</style>
