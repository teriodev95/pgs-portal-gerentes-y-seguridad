<script setup lang="ts">
import { computed, ref } from 'vue'
import { latLng, latLngBounds, type Map as LeafletMap } from 'leaflet'
import { LIcon, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import { toCurrency } from '@/shared/utils'
import {
  agruparPorSemana,
  agruparPorUbicacion,
  claveSemana,
  colorPinSemana,
  diaNominal,
  estadoSemana,
  type PuntoPagos,
  type SemanaGroup
} from '../helpers'
import type { IPayment } from '../types'

// Components
import MapWidget from '@/shared/components/MapWidget.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'

// El mapa es la segunda lectura del MISMO historial que ya está en memoria:
// no consulta nada, por eso el cambio de vista es instantáneo y ambas
// pantallas no pueden desincronizarse.
interface Props {
  historialList: IPayment[]
}

interface Emits {
  (e: 'verDetalles', payment: IPayment): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const ubicaciones = computed(() => agruparPorUbicacion(props.historialList))

// La cobertura es una propiedad de la SEMANA (misma regla que el acordeón):
// el pin la hereda de la semana a la que pertenece su pago más reciente.
const semanas = computed(() => {
  const map = new Map<string, SemanaGroup>()
  for (const grupo of agruparPorSemana(props.historialList)) map.set(grupo.key, grupo)
  return map
})

function semanaDe(pago: IPayment): SemanaGroup | undefined {
  return semanas.value.get(claveSemana(pago))
}

function colorPin(punto: PuntoPagos): string {
  return colorPinSemana(semanaDe(punto.pagos[0]))
}

function textoEstado(pago: IPayment): string {
  const grupo = semanaDe(pago)
  return grupo ? estadoSemana(grupo).texto : ''
}

const centroInicial = computed(() => {
  const primero = ubicaciones.value.puntos[0]
  return primero ? latLng(primero.lat, primero.lng) : latLng(0, 0)
})

const zoom = ref(16)
const mapa = ref<LeafletMap>()

// El drawer de detalles cubre el mapa: dejar el popup abierto detrás hace que
// al cerrarlo el usuario vuelva a un mapa con una tarjeta ya consumida.
function verDetalles(pago: IPayment) {
  mapa.value?.closePopup()
  emit('verDetalles', pago)
}

// El encuadre lo decide el dato, no una constante: todos los pines caben en
// pantalla y se ve de un vistazo si el cobro se concentra o se dispersa.
function onMapReady(map: LeafletMap) {
  mapa.value = map
  map.invalidateSize()
  const puntos = ubicaciones.value.puntos
  if (!puntos.length) return
  if (puntos.length === 1) {
    map.setView(latLng(puntos[0].lat, puntos[0].lng), 17)
    return
  }
  map.fitBounds(latLngBounds(puntos.map((p) => latLng(p.lat, p.lng))), {
    padding: [48, 48],
    maxZoom: 17
  })
}
</script>

<template>
  <!-- La altura la fija quien monta el componente (clase heredada); aquí solo
       se garantiza el contexto de posicionamiento para que el mapa lo llene.
       z-0 no es decorativo: crea un contexto de apilamiento propio y encierra
       los z-index internos de Leaflet (panes 400, controles 1000), que si no
       se pintan por encima del drawer de detalles (z-50) y del navbar. -->
  <div class="relative z-0 w-full overflow-hidden">
    <MapWidget
      v-if="ubicaciones.puntos.length"
      :center="[centroInicial.lat, centroInicial.lng]"
      :zoom="zoom"
      readonly
      no-remount
      height-class="absolute inset-0"
      @ready="onMapReady"
    >
      <LMarker
        v-for="punto in ubicaciones.puntos"
        :key="punto.key"
        :lat-lng="latLng(punto.lat, punto.lng)"
      >
        <!-- El pin rotula la SEMANA para que el mapa se lea con el mismo
             vocabulario que la lista; el badge avisa cuántos pagos se
             cobraron en ese mismo lugar -->
        <LIcon :icon-size="[36, 36]" :icon-anchor="[18, 18]" class-name="!bg-transparent !border-0">
          <div class="relative flex h-9 w-9 items-center justify-center">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md"
              :class="colorPin(punto)"
            >
              {{ punto.pagos[0].semana }}
            </span>
            <span
              v-if="punto.pagos.length > 1"
              class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-gray-900 px-1 text-[10px] font-semibold leading-none text-white"
            >
              {{ punto.pagos.length }}
            </span>
          </div>
        </LIcon>

        <LPopup :options="{ closeButton: false, offset: [0, -14], minWidth: 210 }">
          <div class="-my-1 w-full">
            <p class="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {{ punto.pagos.length === 1 ? 'Pago cobrado aquí' : `${punto.pagos.length} pagos cobrados aquí` }}
            </p>
            <button
              v-for="pago in punto.pagos"
              :key="pago.pagoId"
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-md px-1 py-1.5 text-left hover:bg-gray-50 active:bg-gray-100"
              @click="verDetalles(pago)"
            >
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-gray-900">
                  Semana {{ pago.semana }}
                </span>
                <span class="block truncate text-xs text-gray-500">
                  {{ diaNominal(pago.fechaPago) }} · {{ textoEstado(pago) }}
                </span>
              </span>
              <span class="whitespace-nowrap text-sm font-bold text-blue-700">
                {{ toCurrency(pago.monto) }}
              </span>
            </button>
          </div>
        </LPopup>
      </LMarker>
    </MapWidget>

    <!-- Los pagos sin coordenada no se pueden dibujar: decirlo evita leer el
         mapa como si fuera el historial completo -->
    <div
      v-if="ubicaciones.puntos.length"
      class="pointer-events-none absolute inset-x-0 top-2 z-[1000] mx-auto flex w-fit items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs shadow-md"
    >
      <span class="font-semibold text-gray-900">
        {{ ubicaciones.puntos.length }}
        {{ ubicaciones.puntos.length === 1 ? 'ubicación' : 'ubicaciones' }}
      </span>
      <span v-if="ubicaciones.sinUbicacion" class="text-amber-600">
        · {{ ubicaciones.sinUbicacion }} sin ubicación
      </span>
    </div>

    <EmptyCT
      v-else
      message="Sin ubicaciones registradas"
      :description="
        historialList.length
          ? 'Ninguno de los pagos de este crédito guardó coordenadas. Los pagos migrados o capturados sin señal no aparecen en el mapa.'
          : 'No se encontró información del historial de pagos.'
      "
    />
  </div>
</template>

<style scoped>
/* El popup de Leaflet trae padding propio pensado para texto suelto; aquí el
   contenido son filas tocables y necesitan el ancho completo */
:deep(.leaflet-popup-content) {
  margin: 10px 10px;
  width: auto !important;
}
</style>
