<script setup lang="ts">
// Modo Mapa: cada gerente con posición como marcador con sus iniciales en el color de Oficina; los que caen
// encimados en pantalla se agrupan en un «+N» neutro según el zoom. Leaflet se carga sólo aquí (perezoso).
import { computed, ref, watch } from 'vue'
import { latLngBounds, type Map as LeafletMap, type PointExpression } from 'leaflet'
import { LIcon, LMarker } from '@vue-leaflet/vue-leaflet'
import MapWidget from '@/shared/components/MapWidget.vue'
import { agruparMarcadores, colorDe, conBlanco, initials } from '../equipo-gps.helpers'
import type { GerenteEquipo, MarcadorMapa } from '../equipo-gps.types'

const props = defineProps<{ gerentes: GerenteEquipo[]; seleccionado: number | null; margenInferior?: number }>()
const emit = defineEmits<{ (e: 'seleccionar', gerente: GerenteEquipo): void; (e: 'grupo', gerentes: GerenteEquipo[]): void; (e: 'fondo'): void }>()

const mapa = ref<LeafletMap>()
const zoom = ref(13)
const ubicados = computed(() => props.gerentes.filter((g) => g.ubicacion && g.id !== null))
const marcadores = computed<MarcadorMapa[]>(() => agruparMarcadores(ubicados.value, zoom.value))
const centro = computed<PointExpression>(() => {
  const primero = ubicados.value[0]
  return primero?.ubicacion ? [primero.ubicacion.lat, primero.ubicacion.lon] : [19.0414, -98.2063]
})

function encuadrar() {
  const map = mapa.value
  if (!map) return
  map.invalidateSize()
  const puntos = ubicados.value.map((g) => [g.ubicacion!.lat, g.ubicacion!.lon] as [number, number])
  const abajo = (props.margenInferior ?? 0) + 24
  if (puntos.length > 1)
    map.fitBounds(latLngBounds(puntos), { paddingTopLeft: [24, 136], paddingBottomRight: [24, abajo], maxZoom: 15 })
  else if (puntos.length === 1) map.setView(puntos[0], 14)
}

function tocar(marcador: MarcadorMapa) {
  const map = mapa.value
  if (marcador.gerentes.length === 1) return emit('seleccionar', marcador.gerentes[0])
  // Un grupo: acercarse hasta que se separen; si en el zoom tope siguen juntos, la lista del grupo.
  if (map && map.getZoom() < 17) {
    const objetivo = Math.min(17, map.getZoom() + 2)
    if (agruparMarcadores(marcador.gerentes, objetivo).length > 1) {
      map.setView([marcador.lat, marcador.lon], objetivo, { animate: true })
      return
    }
  }
  emit('grupo', marcador.gerentes)
}

function onReady(map: LeafletMap) {
  mapa.value = map
  zoom.value = map.getZoom()
  map.on('zoomend', () => (zoom.value = map.getZoom()))
  map.on('click', () => emit('fondo'))
  encuadrar()
}

watch(() => ubicados.value.map((g) => g.id).join(','), encuadrar)
defineExpose({ encuadrar })
</script>

<template>
  <MapWidget
    :center="centro"
    :zoom="13"
    :max-zoom="17"
    :options="{ preferCanvas: true, zoomControl: false, attributionControl: false }"
    height-class="h-full"
    no-remount
    readonly
    @ready="onReady"
  >
    <LMarker
      v-for="m in marcadores"
      :key="m.gerentes.map((g) => g.id).join('-')"
      :lat-lng="[m.lat, m.lon]"
      :z-index-offset="m.gerentes.some((g) => g.id === seleccionado) ? 1000 : m.gerentes.length > 1 ? 500 : 0"
      @click="tocar(m)"
    >
      <LIcon :icon-size="[36, 36]" :icon-anchor="[18, 18]" class-name="equipo-gps-pin">
        <span v-if="m.gerentes.length > 1" class="equipo-gps-pin__chip is-grupo" :aria-label="`${m.gerentes.length} gerentes juntos`">
          +{{ m.gerentes.length }}
        </span>
        <span
          v-else
          class="equipo-gps-pin__chip"
          :class="[m.gerentes[0].estado === 'activo' ? 'is-activo' : 'is-sin-senal', m.gerentes[0].id === seleccionado && 'is-seleccionado']"
          :style="{ '--color': colorDe(m.gerentes[0]), '--color-suave': conBlanco(colorDe(m.gerentes[0]), 0.55) }"
          :aria-label="m.gerentes[0].nombre ?? ''"
        >
          {{ initials(m.gerentes[0].nombre) }}
        </span>
      </LIcon>
    </LMarker>
  </MapWidget>
</template>

<style>
.equipo-gps-pin {
  background: transparent;
  border: 0;
}
.equipo-gps-pin__chip {
  align-items: center;
  border-radius: 9999px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.24);
  color: #ffffff;
  display: flex;
  font-size: 13px;
  font-weight: 700;
  height: 36px;
  justify-content: center;
  letter-spacing: 0.02em;
  width: 36px;
}
/* Activo: color sólido con anillo blanco. */
.equipo-gps-pin__chip.is-activo {
  background: var(--color);
  border: 2px solid #ffffff;
}
/* Sin señal: el mismo color al 45 % con anillo gris punteado; el estado no pelea con el color. */
.equipo-gps-pin__chip.is-sin-senal {
  background: var(--color-suave);
  border: 2px dotted #64748b;
}
.equipo-gps-pin__chip.is-grupo {
  background: #ffffff;
  border: 2px solid #cbd5e1;
  color: #0f172a;
}
.equipo-gps-pin__chip.is-seleccionado {
  outline: 3px solid #2563eb;
  outline-offset: 1px;
}
</style>
