import { computed, onBeforeMount, ref } from 'vue'
import { latLng, type LatLng } from 'leaflet'
import { useStore } from '@/shared/stores'
import { useRouter } from 'vue-router'
import { paymentDetailsService } from '../services/payment-details.service'
import type { AgenciaPagosHistorial } from '../types'
import { useMapbox } from '../helpers'
import { MAP_CONFIG } from '../constants'
import { usePaymentDetailsErrorHandler } from './usePaymentHistoryErrorHandler'

export function useMapPaymentData() {
  // Services, Composables and Stores initialization
  const $store = useStore()
  const $router = useRouter()
  const { initMap, generateGeoJson, heatMap } = useMapbox()
  const { handleApiError, handleMapInitError, showSuccess } = usePaymentDetailsErrorHandler()

  // State definitions
  const loadedData = ref(false)
  const center = ref<LatLng>(latLng(0, 0))
  const zoom = ref<number>(MAP_CONFIG.DEFAULT_ZOOM)
  const showHeatMap = ref(true)
  const historial = ref<AgenciaPagosHistorial>()
  const historialList = ref<AgenciaPagosHistorial[]>([])
  const mapboxMap = ref<mapboxgl.Map>()

  // Computed properties
  const agencia = computed(() => $store.agencySelected)
  const currentDate = computed(() => $store.currentDate)
  const hasPaymentData = computed(() => historialList.value.length > 0)
  const selectedPayment = computed(() => historial.value)

  // Methods
  function onMapBack() {
    $router.back()
  }

  function onClickMarker(hist: AgenciaPagosHistorial) {
    historial.value = undefined
    setTimeout(() => (historial.value = hist), MAP_CONFIG.TRANSITION_DELAY)
  }

  function onUpdateCenter(coords: LatLng) {
    center.value = coords
  }

  function toggleHeat() {
    if (showHeatMap.value) {
      const mapboxCenter = mapboxMap.value?.getCenter()
      const mapboxZoom = mapboxMap.value?.getZoom()
      // @ts-ignore
      center.value = latLng(mapboxCenter?.lat, mapboxCenter?.lng)
      zoom.value = Number(mapboxZoom) + 1
    } else {
      mapboxMap.value?.setZoom(zoom.value - 1)
      mapboxMap.value?.setCenter([center.value.lng, center.value.lat])
    }
    showHeatMap.value = !showHeatMap.value
  }

  async function fetchPaymentData(): Promise<void> {
    if (!agencia.value) return

    $store.loading = true
    try {
      const { data } = await paymentDetailsService.getPagosByDate({
        agency: agencia.value,
        week: currentDate.value.week,
        year: currentDate.value.year
      })

      historialList.value = data

      if (data.length) {
        center.value = latLng(data[0].lat, data[0].lng)
        loadedData.value = true

        try {
          mapboxMap.value = initMap({
            center: [center.value.lng, center.value.lat],
            container: MAP_CONFIG.CONTAINER_ID,
            style: MAP_CONFIG.MAPBOX_STYLE,
            zoom: MAP_CONFIG.DEFAULT_ZOOM
          })

          mapboxMap.value.on('load', () => {
            mapboxMap.value?.setCenter([center.value.lng, center.value.lat])
          })

          const list: { lat: number; lng: number }[] = []

          historialList.value.forEach((ls) => {
            list.push({
              lat: ls.lat,
              lng: ls.lng
            })
          })

          const geoJson = generateGeoJson(list)
          heatMap(mapboxMap.value, geoJson)

          showSuccess('Datos de pagos cargados correctamente')
        } catch (mapError) {
          handleMapInitError(mapError)
        }
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      $store.loading = false
    }
  }

  function clearSelectedPayment(): void {
    historial.value = undefined
  }

  // Lifecycle hooks
  onBeforeMount(async () => {
    await fetchPaymentData()
  })

  return {
    // State
    loadedData,
    center,
    zoom,
    showHeatMap,
    historialList,
    mapboxMap,

    // Computed
    agencia,
    currentDate,
    hasPaymentData,
    selectedPayment,

    // Methods
    onMapBack,
    onClickMarker,
    onUpdateCenter,
    toggleHeat,
    fetchPaymentData,
    clearSelectedPayment
  }
}