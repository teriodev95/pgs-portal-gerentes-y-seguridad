<script lang="ts" setup>
import { toRefs } from 'vue'
import 'leaflet/dist/leaflet.css'
import type { LatLng, LocationEvent, PointExpression } from 'leaflet'
import { LControl, LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet'

import BackIcon from '@/shared/components/icons/BackIcon.vue'
/**
 * ATTRIBUTION
 */
const ATTRIBUTION =
  '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
/**
 * MAP_URL
 */
const MAP_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

const settings = {
  multiple: false,
  zoom: {
    max: 18,
    min: 4
  }
}

const $emit = defineEmits<{
  (e: 'update:marker', p: LatLng): void
  (e: 'update:center', p: LatLng): void
  (e: 'update:zoom', p: number): void
  (e: 'goBack'): void
}>()

const $props = defineProps<{
  marker?: LatLng
  center: PointExpression
  zoom: number
  readonly?: boolean
  back?: boolean
}>()

const { marker, center, zoom, readonly } = toRefs($props)

/**
 * -----------------------------------------
 *	Data
 * -----------------------------------------
 */

/**
 * addMarker
 */
function addMarker(event: MouseEvent | PointerEvent | LocationEvent) {
  if (readonly.value) return
  if ((event as LocationEvent).latlng) {
    $emit('update:marker', (event as LocationEvent).latlng)
  }
}

/**
 * doMoveCenter
 * @param _center
 */
function doMoveCenter(_center: LatLng) {
  $emit('update:center', _center)
}
/**
 * doMoveZoom
 * @param _zoom
 */
function doMoveZoom(_zoom: number) {
  $emit('update:zoom', _zoom)
}
</script>

<template>
  <l-map
    ref="map"
    id="map--pageleaflet"
    class="h-screen w-full"
    :zoom="Number(zoom)"
    :center="center"
    :min-zoom="settings.zoom.min"
    :max-zoom="settings.zoom.max"
    @click="addMarker"
    @update:center="doMoveCenter"
    @update:zoom="doMoveZoom"
    :key="`map-key-${zoom}-${center.toString()}`"
  >
    <l-tile-layer :url="MAP_URL" :attribution="ATTRIBUTION" />
    <l-control
      v-if="back"
      class="top-1 flex cursor-pointer items-center justify-start rounded-sm border border-black bg-white p-2"
      @click="$emit('goBack')"
    >
      <BackIcon />
    </l-control>
    <slot />

    <l-marker :lat-lng="marker" v-if="marker" @click="console.log('hola')" />
  </l-map>
</template>
