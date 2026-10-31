<script setup lang="ts">
// Este componente es el único que importa Leaflet: entra al chunk perezoso que ya existe para
// MapWidget y se descarga sólo cuando alguien abre el detalle de un gerente.
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

const etiquetaInicio = computed(() => (extremos.value ? `Inicio ${formatTime(extremos.value.start[2])}` : ''))
const etiquetaFin = computed(() => {
  if (!extremos.value) return props.ubicacion ? `Último punto ${formatTime(props.ubicacion.registrado_at)}` : ''
  const hora = formatTime(props.ubicacion?.registrado_at ?? extremos.value.end[2])
  return `${props.enVivo ? 'Último punto' : 'Fin'} ${hora}`
})

function encuadrar() {
  const map = mapa.value
  if (!map) return
  map.invalidateSize()
  const puntos = bandas.value.flatMap((banda) => banda.points)
  if (props.ubicacion) puntos.push([props.ubicacion.lat, props.ubicacion.lon])
  if (puntos.length > 1) map.fitBounds(latLngBounds(puntos), { padding: [24, 24], maxZoom: 16 })
  else if (puntos.length === 1) map.setView(puntos[0], 15)
}

function onReady(map: LeafletMap) {
  mapa.value = map
  encuadrar()
}

watch(bandas, encuadrar)
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
    <MapWidget
      :center="centro"
      :zoom="15"
      :max-zoom="17"
      :options="{ preferCanvas: true, zoomControl: false, attributionControl: true }"
      height-class="h-[52vh] min-h-[280px]"
      no-remount
      readonly
      @ready="onReady"
    >
      <!-- Huecos sin ubicación: punteados y nunca unidos a la ruta. -->
      <LPolyline
        v-for="(hueco, index) in huecos"
        :key="`hueco-${index}`"
        :lat-lngs="[hueco.from, hueco.to]"
        :color="'#64748b'"
        :weight="2"
        :opacity="0.9"
        :dash-array="'2 6'"
        :interactive="false"
      >
        <LTooltip :options="{ permanent: true, direction: 'center', className: 'equipo-gps-gap' }">
          Sin ubicación {{ formatDuration(hueco.seconds) }}
        </LTooltip>
      </LPolyline>

      <LPolyline
        v-for="(banda, index) in bandas"
        :key="`banda-${index}`"
        :lat-lngs="banda.points"
        :color="shade(EQUIPO_GPS_COLOR, banda.band / (BANDS - 1))"
        :weight="5"
        :opacity="1"
        :line-cap="'round'"
        :line-join="'round'"
        :interactive="false"
      />

      <LCircleMarker
        v-if="extremos"
        :lat-lng="[extremos.start[0], extremos.start[1]]"
        :radius="6"
        :color="'#ffffff'"
        :fill-color="shade(EQUIPO_GPS_COLOR, 0)"
        :fill-opacity="1"
        :weight="2"
      >
        <LTooltip :options="{ permanent: true, direction: 'top', offset: [0, -6] }">{{ etiquetaInicio }}</LTooltip>
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
        <LTooltip :options="{ permanent: true, direction: 'top', offset: [0, -8] }">{{ etiquetaFin }}</LTooltip>
      </LCircleMarker>
    </MapWidget>

    <!-- Leyenda del degradado: Inicio ▬ Fin -->
    <div
      v-if="bandas.length"
      class="pointer-events-none absolute bottom-2 left-2 z-[400] flex items-center gap-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow"
    >
      Inicio
      <span
        class="h-1.5 w-14 rounded-full"
        :style="{ background: `linear-gradient(90deg, ${shade(EQUIPO_GPS_COLOR, 0)}, ${shade(EQUIPO_GPS_COLOR, 1)})` }"
      />
      Fin
    </div>
  </div>
</template>

<style>
.equipo-gps-gap {
  background: rgba(255, 255, 255, 0.92);
  border: 1px dashed #94a3b8;
  color: #475569;
  font-size: 11px;
  padding: 1px 6px;
}
.equipo-gps-gap::before {
  display: none;
}
</style>
