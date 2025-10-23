<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css'
import { latLng } from 'leaflet'
import { LMarker } from '@vue-leaflet/vue-leaflet'
import { useMapPaymentData } from '../composables'
/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import BackIcon from '@/shared/components/icons/BackIcon.vue'
import IconMap from '@/shared/components/icons/MapPapperIcon.vue'
import MapWidget from '@/shared/components/MapWidget.vue'
import PaymentDetailsPopup from '../components/PaymentDetailsPopup.vue'
import MapControls from '../components/MapControls.vue'

/**
 * ------------------------------------------
 *	Composables
 * ------------------------------------------
 */

const {
  center,
  zoom,
  showHeatMap,
  historialList,
  selectedPayment,
  onMapBack,
  onClickMarker,
  onUpdateCenter,
  toggleHeat
} = useMapPaymentData()
</script>

<template>
  <main class="relative min-h-screen">
    <div class="fixed top-0 z-20 h-screen w-screen">
      <MapControls
        :show-heat-map="showHeatMap"
        @back="onMapBack"
        @toggle-heat="toggleHeat"
      >
        <template #back-icon>
          <BackIcon class="h-6 w-6" />
        </template>
        <template #map-icon>
          <IconMap class="h-6 w-6" />
        </template>
      </MapControls>

      <div id="heat-map" v-show="showHeatMap"></div>

      <MapWidget
        v-show="!showHeatMap"
        :center="[center.lat, center.lng]"
        v-model:zoom="zoom"
        @update:center="onUpdateCenter"
        readonly
        class="z-20"
      >
        <LMarker
          v-for="(item, key) in historialList"
          :key="`marker-${key}`"
          :lat-lng="latLng(item.lat, item.lng)"
          @click="() => onClickMarker(item)"
        />
      </MapWidget>
    </div>

    <PaymentDetailsPopup :payment="selectedPayment" />
  </main>
</template>

<style>
#heat-map {
  top: 0;
  bottom: 0;
  width: 100%;
  position: absolute;
  height: 100%;
}

canvas {
  height: 100vh !important;
  width: auto !important;
}
</style>
