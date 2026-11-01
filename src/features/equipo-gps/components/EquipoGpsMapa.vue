<script setup lang="ts">
// Único componente del detalle que importa Leaflet: entra al chunk perezoso que ya existe para MapWidget.
import { computed, ref, watch } from 'vue'
import { latLngBounds, type LeafletMouseEvent, type Map as LeafletMap, type PointExpression } from 'leaflet'
import { LCircleMarker, LIcon, LMarker, LPolyline, LTooltip } from '@vue-leaflet/vue-leaflet'
import MapWidget from '@/shared/components/MapWidget.vue'
import EquipoGpsPilaParadas from './EquipoGpsPilaParadas.vue'
import { EQUIPO_GPS_COLOR } from '../equipo-gps.constants'
import {
  clock, desproyectar, flechasVisibles, FLECHAS_SEPARACION_PX, formatDuration, formatTime, gapLinks, longestStops, marcasDeHora,
  paradasVisibles, passesNear, passLabel, pathArrows, pilasDeParadas, proyectar, proyectarDia, routeBands, routeEnds, shade, STOP_PX,
  stopSize, ZOOM_HORAS
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
const emit = defineEmits<{ (e: 'parada', index: number): void; (e: 'arrastre'): void; (e: 'zoom', zoom: number): void }>()

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
// La seleccionada se dibuja siempre; las que comparten lugar forman una pila con ella (o la primera) encima.
const visibles = computed(() => paradasVisibles(paradas.value, zoom.value, 18, props.paradaSeleccionada ?? null))
const pilas = computed(() => pilasDeParadas(paradas.value, zoom.value, props.paradaSeleccionada ?? null))
const pilaDe = (index: number) => pilas.value.find((pila) => pila.encima === index)
/** La seleccionada (suelta o en pila) y su etiqueta van en su propio pane, arriba de marcadores y tooltips. */
const paneDe = (index: number) => (props.paradaSeleccionada === index ? 'paradaActiva' : 'markerPane')

// Puebla por defecto cuando aún no hay dónde centrar; `encuadrar` manda en cuanto hay datos.
const centro = computed<PointExpression>(() =>
  props.ubicacion ? [props.ubicacion.lat, props.ubicacion.lon] : [19.0414, -98.2063]
)

// Degradado inicio → fin como MOX: 12 polilíneas de clara a oscura según la distancia del día.
const bandas = computed(() => (props.recorrido ? routeBands(props.recorrido.tramos, BANDS) : []))
const huecos = computed(() => (props.recorrido ? gapLinks(props.recorrido) : []))
const extremos = computed(() => (props.recorrido ? routeEnds(props.recorrido.tramos) : null))

// --- Horas de paso (v6): marcas de reloj desde zoom 15 y «¿A qué hora pasó por aquí?» al tocar la ruta. ---
// La proyección se hace una vez por zoom y por día; qué marcas se ven, al terminar de mover o de hacer zoom. Nunca por cuadro.
const proyeccion = computed(() => (props.recorrido && !props.soloParadas ? proyectarDia(props.recorrido.tramos, zoom.value) : { puntos: [], lineas: [] }))
const puntosHora = computed(() => proyeccion.value.puntos)
const toques = computed(() => (props.soloParadas ? [] : bandas.value.filter((banda) => !banda.estimated)))
/** Lo que tapan el chip de arriba, los botones flotantes y el panel no cuenta como vista. */
function vistaUtil(izq: number, arriba: number, der: number, abajo: number) {
  const limites = mapa.value?.getPixelBounds()
  if (!limites?.min || !limites.max) return null
  return { minX: limites.min.x + izq, minY: limites.min.y + arriba, maxX: limites.max.x - der, maxY: limites.max.y - (props.margenInferior ?? 0) - abajo }
}
/** Paradas, Inicio y Fin proyectados al zoom actual; Inicio y Fin llevan etiqueta fija encima y piden más aire. */
const fijos = computed(() => {
  const z = zoom.value
  const pix = (lat: number, lon: number) => {
    const [x, y] = proyectar(lat, lon, z)
    return { x, y }
  }
  const lista: { x: number; y: number; r?: number }[] = paradas.value.map((p) => pix(p.lat, p.lon))
  if (extremos.value) lista.push({ ...pix(extremos.value.start[0], extremos.value.start[1]), r: 64 }, { ...pix(extremos.value.end[0], extremos.value.end[1]), r: 64 })
  if (props.ubicacion) lista.push({ ...pix(props.ubicacion.lat, props.ubicacion.lon), r: 64 })
  return lista
})
const marcas = computed(() => {
  void vista.value
  if (zoom.value < ZOOM_HORAS || !puntosHora.value.length) return []
  const rect = vistaUtil(16, 110, 64, 72) // el texto va a la derecha del punto
  return rect ? marcasDeHora(puntosHora.value, zoom.value, rect, fijos.value) : []
})

// --- Flechas de sentido (v6b): cada ~110 px de pantalla sobre la línea sólida, fijas por zoom; mover sólo muestra u oculta. ---
const flechas = computed(() => {
  const z = zoom.value
  return proyeccion.value.lineas.flatMap((linea) =>
    pathArrows(linea, FLECHAS_SEPARACION_PX).map((f) => {
      const [lat, lon] = desproyectar(f.x, f.y, z)
      return { ...f, lat, lon }
    })
  )
})
const flechasVistas = computed(() => {
  void vista.value
  if (!flechas.value.length) return []
  const rect = vistaUtil(8, 100, 8, 8)
  if (!rect) return []
  // Paradas, Inicio/Fin y marcas de hora (con su texto a la derecha) mandan sobre las flechas.
  const protegidos = [...fijos.value, ...marcas.value.flatMap((m) => [{ x: m.x, y: m.y }, { x: m.x + 28, y: m.y }])]
  return flechasVisibles(flechas.value, rect, protegidos)
})
/** El globo «Pasó a las …» del último toque sobre la ruta; se queda hasta tocar otra parte del mapa. */
const pase = ref<{ lat: number; lon: number; texto: string } | null>(null)
function tocarRuta(event: LeafletMouseEvent) {
  const map = mapa.value
  if (!map) return
  const { x, y } = map.project(event.latlng, zoom.value)
  const found = passesNear(puntosHora.value, { x, y })
  pase.value = found ? { lat: found.at.lat, lon: found.at.lon, texto: passLabel(found.passes.map((p) => clock(p.time))) } : null
}
watch(puntosHora, () => (pase.value = null))
/** Una fila del globo de la pila: selecciona esa parada (como el navegador) y cierra el globo. */
function elegirDePila(index: number) {
  mapa.value?.closePopup()
  emit('parada', index)
}

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
  map.createPane('paradaActiva').style.zIndex = '690'
  zoom.value = map.getZoom()
  emit('zoom', zoom.value)
  map.on('zoomend', () => emit('zoom', (zoom.value = map.getZoom())))
  map.on('moveend zoomend resize', () => (vista.value += 1))
  map.on('click', () => (pase.value = null))
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

    <!-- Área de toque de la ruta (28 px, invisible): «¿A qué hora pasó por aquí?». No burbujea: tocar la ruta no es tocar el mapa.
         Las paradas (marcadores) quedan encima y ganan el toque. -->
    <LPolyline
      v-for="(banda, index) in toques"
      :key="`toque-${index}`"
      :lat-lngs="banda.points"
      :color="'#000000'"
      :opacity="0"
      :weight="28"
      :options="{ bubblingMouseEvents: false }"
      @click="tocarRuta"
    />

    <!-- Flechas de sentido (como MOX): SVG de 16 px girado al rumbo, bajo las paradas y las marcas. No se tocan. -->
    <LMarker
      v-for="flecha in flechasVistas"
      :key="`flecha-${Math.round(flecha.x)}-${Math.round(flecha.y)}`"
      :lat-lng="[flecha.lat, flecha.lon]"
      :options="{ interactive: false, keyboard: false }"
      :z-index-offset="-200"
    >
      <LIcon :icon-size="[16, 16]" :icon-anchor="[8, 8]" class-name="equipo-gps-flecha">
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" :style="{ transform: `rotate(${Math.round(flecha.angle)}deg)` }"><path d="M8 2 13.5 13 8 10.5 2.5 13Z" /></svg>
      </LIcon>
    </LMarker>

    <!-- Marcas de reloj (desde zoom 15): un punto chico sobre la línea y la hora a un lado. No se tocan. -->
    <LMarker
      v-for="marca in marcas"
      :key="`hora-${marca.tramo}-${marca.time}`"
      :lat-lng="[marca.lat, marca.lon]"
      :options="{ interactive: false, keyboard: false }"
    >
      <LIcon :icon-size="[56, 14]" :icon-anchor="[4, 7]" class-name="equipo-gps-hora">
        <span class="equipo-gps-hora__punto" /><span class="equipo-gps-hora__texto">{{ clock(marca.time) }}</span>
      </LIcon>
    </LMarker>

    <template v-for="index in visibles" :key="`parada-${index}-${paneDe(index)}`">
      <EquipoGpsPilaParadas
        v-if="(pilaDe(index)?.indices.length ?? 1) > 1"
        :paradas="paradas"
        :pila="pilaDe(index)!"
        :color="colorPersona"
        :seleccionada="paradaSeleccionada === index"
        :lado="direccion(paradas[index].lat, paradas[index].lon) === 'left' ? 'left' : 'right'"
        @elegir="elegirDePila"
      />
      <LMarker
        v-else
        :lat-lng="[paradas[index].lat, paradas[index].lon]"
        :pane="paneDe(index)"
        :z-index-offset="500"
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
            className: paradaSeleccionada === index ? 'equipo-gps-label' : 'equipo-gps-parada-label',
            pane: paneDe(index) === 'paradaActiva' ? 'paradaActiva' : 'tooltipPane'
          }"
        >
          <template v-if="paradaSeleccionada === index">
            Parada {{ index + 1 }} · {{ formatTime(paradas[index].inicio) }} · {{ formatDuration(paradas[index].segundos) }}
          </template>
          <template v-else-if="masLargas.includes(index)">{{ formatDuration(paradas[index].segundos) }}</template>
          <template v-else>{{ formatTime(paradas[index].inicio) }} · {{ formatDuration(paradas[index].segundos) }}</template>
        </LTooltip>
      </LMarker>
    </template>

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

    <!-- «Pasó a las 15:42»: un punto en el lugar y el globo encima, por arriba de las etiquetas fijas. -->
    <LMarker v-if="pase" :lat-lng="[pase.lat, pase.lon]" :options="{ interactive: false, keyboard: false }" pane="popupPane">
      <LIcon :icon-size="[12, 12]" :icon-anchor="[6, 6]" class-name="equipo-gps-pase">
        <span class="equipo-gps-pase__punto" /><span class="equipo-gps-pase__globo">{{ pase.texto }}</span>
      </LIcon>
    </LMarker>

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
/* Flechas de sentido: relleno oscuro con borde blanco de 1.5, como MOX `.arrowMarker`; nunca reciben el toque. */
.equipo-gps-flecha {
  background: transparent;
  border: 0;
  pointer-events: none;
}
.equipo-gps-flecha svg {
  display: block;
}
.equipo-gps-flecha path {
  fill: #171717;
  stroke: #ffffff;
  stroke-linejoin: round;
  stroke-width: 1.5;
}
/* Marcas de reloj: punto chico sobre la línea y la hora con halo blanco, sin caja ni sombra; nunca reciben el toque. */
.equipo-gps-hora {
  align-items: center;
  background: transparent;
  border: 0;
  display: flex;
  gap: 4px;
  pointer-events: none;
  white-space: nowrap;
}
.equipo-gps-hora__punto {
  background: #ffffff;
  border: 2px solid #334155;
  border-radius: 9999px;
  box-sizing: border-box;
  flex: none;
  height: 8px;
  width: 8px;
}
.equipo-gps-hora__texto {
  -webkit-text-stroke: 3px #ffffff;
  color: #334155;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  line-height: 14px;
  paint-order: stroke fill;
}
/* «Pasó a las …»: punto en el lugar y globo encima con su pico. */
.equipo-gps-pase {
  background: transparent;
  border: 0;
  pointer-events: none;
  position: relative;
}
.equipo-gps-pase__punto {
  background: #ffffff;
  border: 3px solid #2563eb;
  border-radius: 9999px;
  box-sizing: border-box;
  display: block;
  height: 12px;
  width: 12px;
}
.equipo-gps-pase__globo {
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 8px;
  bottom: 18px;
  color: #0f172a;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  left: 50%;
  padding: 4px 8px;
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
}
.equipo-gps-pase__globo::after {
  border: 6px solid transparent;
  border-bottom: 0;
  border-top-color: #ffffff;
  content: '';
  left: 50%;
  position: absolute;
  top: 100%;
  transform: translateX(-50%);
}
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
/* Pila de paradas: el círculo de encima, una hoja detrás (3 px) y «×N» chica en el color de la persona. */
.equipo-gps-pila {
  display: block;
  position: relative;
}
.equipo-gps-pila__hoja {
  background: #ffffff;
  border: 2px solid;
  border-radius: 9999px;
  box-sizing: border-box;
  height: 100%;
  left: 3px;
  position: absolute;
  top: 3px;
  width: 100%;
}
.equipo-gps-pila .equipo-gps-parada__punto {
  position: relative;
}
.equipo-gps-pila__n {
  border-radius: 9999px;
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  line-height: 12px;
  padding: 0 3px;
  position: absolute;
  right: -8px;
  top: -5px;
}
.leaflet-popup.equipo-gps-pila-globo .leaflet-popup-content-wrapper {
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 8px;
  box-shadow: none;
  padding: 0;
}
.leaflet-popup.equipo-gps-pila-globo .leaflet-popup-content {
  margin: 0;
  min-width: 160px;
}
.leaflet-popup.equipo-gps-pila-globo .leaflet-popup-tip {
  box-shadow: none;
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
