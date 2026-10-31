<script setup lang="ts">
// Modo Mapa de la lista: todos los gerentes con posición como marcadores con sus iniciales. Leaflet se
// carga sólo al entrar aquí (este componente es perezoso).
import { computed, ref, watch } from 'vue'
import { latLngBounds, type Map as LeafletMap, type PointExpression } from 'leaflet'
import { LIcon, LMarker } from '@vue-leaflet/vue-leaflet'
import MapWidget from '@/shared/components/MapWidget.vue'
import { initials } from '../equipo-gps.helpers'
import type { GerenteEquipo } from '../equipo-gps.types'

const props = defineProps<{ gerentes: GerenteEquipo[]; seleccionado: number | null }>()
const emit = defineEmits<{ (e: 'seleccionar', gerente: GerenteEquipo | null): void }>()

const mapa = ref<LeafletMap>()
const ubicados = computed(() => props.gerentes.filter((g) => g.ubicacion && g.id !== null))
const centro = computed<PointExpression>(() => {
  const primero = ubicados.value[0]
  return primero?.ubicacion ? [primero.ubicacion.lat, primero.ubicacion.lon] : [19.0414, -98.2063]
})

function encuadrar() {
  const map = mapa.value
  if (!map) return
  map.invalidateSize()
  const puntos = ubicados.value.map((g) => [g.ubicacion!.lat, g.ubicacion!.lon] as [number, number])
  if (puntos.length > 1) map.fitBounds(latLngBounds(puntos), { padding: [32, 32], maxZoom: 15 })
  else if (puntos.length === 1) map.setView(puntos[0], 14)
}

function onReady(map: LeafletMap) {
  mapa.value = map
  encuadrar()
  map.on('click', () => emit('seleccionar', null))
}

watch(() => ubicados.value.length, encuadrar)
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
      v-for="g in ubicados"
      :key="g.id!"
      :lat-lng="[g.ubicacion!.lat, g.ubicacion!.lon]"
      :z-index-offset="g.id === seleccionado ? 1000 : 0"
      @click="emit('seleccionar', g)"
    >
      <LIcon :icon-size="[32, 32]" :icon-anchor="[16, 16]" class-name="equipo-gps-pin">
        <span
          class="equipo-gps-pin__chip"
          :class="[g.estado === 'activo' ? 'is-activo' : 'is-gris', g.id === seleccionado && 'is-seleccionado']"
        >
          {{ initials(g.nombre) }}
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
  border: 2px solid #ffffff;
  border-radius: 9999px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.24);
  display: flex;
  font-size: 12px;
  font-weight: 700;
  height: 32px;
  justify-content: center;
  letter-spacing: 0.02em;
  width: 32px;
}
.equipo-gps-pin__chip.is-activo {
  background: #10b981;
  color: #ffffff;
}
.equipo-gps-pin__chip.is-gris {
  background: #ffffff;
  color: #475569;
  border-color: #94a3b8;
}
.equipo-gps-pin__chip.is-seleccionado {
  outline: 3px solid #2563eb;
  outline-offset: 1px;
}
</style>
