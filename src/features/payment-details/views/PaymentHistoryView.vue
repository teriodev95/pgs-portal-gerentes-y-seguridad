<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { ROUTE_NAME } from '@/router'
import { useRoute, useRouter } from 'vue-router'
import { latLng } from 'leaflet'
import { RotateCw } from 'lucide-vue-next'
import type { IPayment } from '../types'
import { usePaymentHistory } from '../composables'
import { agruparPorSemana, type Cobertura } from '../helpers'

// Components
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import MapWidget from '@/shared/components/MapWidget.vue'
import NavigationIcon from '@/shared/components/icons/NavigationIcon.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import PaymentAccordion from '@/features/payment-details/components/PaymentAccordion.vue'
import PaymentHistoryMap from '@/features/payment-details/components/PaymentHistoryMap.vue'
import LoanGeneralInfo from '@/features/payment-details/components/LoanGeneralInfo.vue'
import PagoDetallesDrawer, { type AccionPago } from '@/features/payment-details/components/PagoDetallesDrawer.vue'
import AdelantarSemanasDrawer from '@/features/payment-details/components/AdelantarSemanasDrawer.vue'

// Composables
const route = useRoute()
const $router = useRouter()
const {
  historyList,
  loanData,
  mapMarker,
  isLoading,
  loadError,
  loadLoanHistory,
  hideMap,
  showMap,
  startNavigation
} = usePaymentHistory()

// Consulta (?modo=consulta&solicitud=ID): quien revisa una solicitud viene a
// ver cómo pagó el cliente su último crédito. Solo los pagos —el crédito puede
// estar archivado—, sin acciones operativas, y el atrás regresa a la solicitud.
const esConsulta = computed(() => route.query.modo === 'consulta')

// Lo que se ve, contado por semana. "Desfase" es la regla del score: semana
// sin pago o con pago parcial.
const resumen = computed(() => {
  const semanas = agruparPorSemana(historyList.value)
  const contar = (cobertura: Cobertura) => semanas.filter((s) => s.cobertura === cobertura).length
  return { completas: contar('completa'), parciales: contar('parcial'), sinPago: contar('sin-pago') }
})
const hayDesfases = computed(() => resumen.value.parciales + resumen.value.sinPago > 0)
const soloDesfases = ref(false)

const hayContenido = computed(
  () => !isLoading.value && (esConsulta.value ? historyList.value.length > 0 : !!loanData.value)
)

function plural(n: number, singular: string, varios: string) {
  return `${n} ${n === 1 ? singular : varios}`
}

// Drawers: "Ver detalles" concentra las acciones del pago; desde ahí puede
// abrirse el flujo de adelantar semanas (un drawer a la vez).
const detallesPayment = ref<IPayment | null>(null)
const adelantarPayment = ref<IPayment | null>(null)

// La vista activa vive en la URL: el atrás del navegador (y el botón físico
// de Android en Capacitor) deshace el cambio de vista antes de salir del
// historial, y el enlace con ?vista=mapa abre directo en el mapa.
type Vista = 'lista' | 'mapa'

const VISTAS: { id: Vista; label: string }[] = [
  { id: 'lista', label: 'Lista' },
  { id: 'mapa', label: 'Mapa' }
]

const vista = computed<Vista>(() => (route.query.vista === 'mapa' ? 'mapa' : 'lista'))

// ¿El mapa lo abrió el toggle en esta sesión de pantalla? Si sí, volver a la
// lista deshace esa entrada en vez de apilar otra: alternar N veces no deja
// N pantallas que cerrar para salir.
const mapaAbiertoPorToggle = ref(false)

function cambiarVista(destino: Vista) {
  if (destino === vista.value) return

  if (destino === 'mapa') {
    mapaAbiertoPorToggle.value = true
    $router.push({ query: { ...route.query, vista: 'mapa' } })
    return
  }

  if (mapaAbiertoPorToggle.value) {
    mapaAbiertoPorToggle.value = false
    $router.back()
    return
  }

  const resto = { ...route.query }
  delete resto.vista
  $router.replace({ query: resto })
}

// Methods
function handleVerDetalles(payment: IPayment) {
  detallesPayment.value = payment
}

function handleAccionPago(accion: AccionPago, payment: IPayment) {
  detallesPayment.value = null

  if (accion === 'showMap') {
    if (!payment.lat || !payment.lng) return
    showMap(latLng(payment.lat, payment.lng))
  } else if (accion === 'correction') {
    $router.push({
      name: ROUTE_NAME.RECORD_CORRECTION,
      params: {
        type: 'pago',
        id: payment.pagoId,
        amount: payment.monto.toString()
      }
    })
  }
}

// El adelanto se dispara desde el nivel semana (acordeón); el pago recibido
// es el ancla que el SP usa para ubicar la semana y dejar auditoría
function handleAdelantar(payment: IPayment) {
  adelantarPayment.value = payment
}

async function cargarHistorial() {
  const loanId = route.query.prestamo as string
  if (loanId) {
    await loadLoanHistory(loanId, { soloPagos: esConsulta.value })
  }
}

// Refresca el historial en segundo plano (Immediate Feedback: el drawer de
// éxito sigue visible; al cerrarlo la lista ya trae el chip de adelantado).
const handleAdelantoMarcado = cargarHistorial

// El detalle de la solicitud es estado local: se reabre con ?solicitud y la
// pestaña con ?tab. Si se llegó desde ella se regresa en el historial del
// navegador (lo mismo que hace el atrás del teléfono), saltando el mapa si lo
// abrió el toggle; si no, se abre en su lugar.
function volverASolicitud() {
  if ($router.options.history.state.back) {
    $router.go(vista.value === 'mapa' && mapaAbiertoPorToggle.value ? -2 : -1)
    return
  }
  $router.replace({
    name: ROUTE_NAME.ADMIN_SOLIM,
    query: { solicitud: route.query.solicitud, tab: 'historial' }
  })
}

function handleBack() {
  if (esConsulta.value) {
    volverASolicitud()
    return
  }
  $router.push({
    name: ROUTE_NAME.DASHBOARD_PRESTAMO,
    query: { prestamo: loanData.value?.prestamoId }
  })
}

// Lifecycle hooks
onBeforeMount(cargarHistorial)
</script>

<template>
  <!-- Main Content -->
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      :title="esConsulta ? 'Pagos del crédito' : 'Historial'"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Loan Data Display -->
    <template v-if="hayContenido">
      <!-- Mismo historial, dos lecturas: la lista responde "¿se pagó?" y el
           mapa "¿dónde se cobró?" -->
      <div class="px-4 pb-1 pt-1">
        <div class="flex w-full rounded-lg bg-gray-200/70 p-1" role="tablist" aria-label="Vista del historial">
          <button
            v-for="opcion in VISTAS"
            :key="opcion.id"
            type="button"
            role="tab"
            :aria-selected="vista === opcion.id"
            class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            :class="vista === opcion.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
            @click="cambiarVista(opcion.id)"
          >
            {{ opcion.label }}
          </button>
        </div>
      </div>

      <SectionContainer v-if="vista === 'lista'">
        <!-- Consulta: sin datos del cliente ni contrato; la cabecera resume
             lo que se ve y deja aislar los desfases -->
        <div v-if="esConsulta" class="rounded-lg border bg-white px-4 py-3">
          <p class="text-xs font-light text-gray-400">Semanas de este crédito</p>
          <p class="mt-0.5 flex flex-wrap gap-x-1.5 text-sm">
            <span class="font-semibold text-gray-700">{{ plural(resumen.completas, 'completa', 'completas') }}</span>
            <span class="text-gray-300" aria-hidden="true">·</span>
            <span :class="resumen.parciales ? 'font-semibold text-amber-600' : 'text-gray-500'">
              {{ plural(resumen.parciales, 'parcial', 'parciales') }}
            </span>
            <span class="text-gray-300" aria-hidden="true">·</span>
            <span :class="resumen.sinPago ? 'font-semibold text-red-500' : 'text-gray-500'">
              {{ resumen.sinPago }} sin pago
            </span>
          </p>

          <button
            v-if="hayDesfases"
            type="button"
            role="switch"
            :aria-checked="soloDesfases"
            class="mt-3 flex min-h-11 w-full items-center justify-between gap-3 border-t border-gray-100 pt-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            @click="soloDesfases = !soloDesfases"
          >
            <span class="text-sm font-medium text-gray-700">Solo desfases</span>
            <span
              class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
              :class="soloDesfases ? 'bg-blue-700' : 'bg-gray-300'"
              aria-hidden="true"
            >
              <span
                class="absolute left-0.5 size-5 rounded-full bg-white shadow transition-transform"
                :class="soloDesfases ? 'translate-x-5' : ''"
              />
            </span>
          </button>
        </div>

        <!-- General Information Card -->
        <LoanGeneralInfo v-else-if="loanData" :loan-data="loanData" />

        <!-- History Items List -->
        <PaymentAccordion
          :historial-list="historyList"
          :solo-lectura="esConsulta"
          :solo-desfases="esConsulta && soloDesfases"
          @ver-detalles="handleVerDetalles"
          @adelantar="handleAdelantar"
        />
      </SectionContainer>

      <!-- Altura explícita en dvh: el mapa no puede heredarla por porcentaje
           (dentro de un flex item con altura implícita, height:100% colapsa a
           cero) y dvh sigue a las barras del navegador móvil. El resto son el
           navbar y el selector de vista. -->
      <div v-else class="p-2">
        <PaymentHistoryMap
          :historial-list="historyList"
          class="h-[calc(100dvh_-_9rem)] min-h-[22rem] rounded-lg border bg-white"
          @ver-detalles="handleVerDetalles"
        />
      </div>
    </template>

    <!-- Loading State -->
    <LoadSkeleton v-else-if="isLoading" :items="9" />

    <!-- Consulta: un fallo de red no es "sin pagos"; se dice y se reintenta -->
    <div v-else-if="esConsulta && loadError" class="px-4 pb-6">
      <EmptyCT
        compact
        message="No se pudieron cargar los pagos"
        description="Revisa tu conexión e inténtalo de nuevo."
      />
      <BtnComponent variant="primary" full-width @click="cargarHistorial">
        <template #icon-left>
          <RotateCw class="size-4" />
        </template>
        Reintentar
      </BtnComponent>
    </div>

    <EmptyCT
      v-else-if="esConsulta"
      message="Sin pagos registrados"
      description="Este crédito todavía no tiene pagos."
    />

    <!-- Empty State -->
    <EmptyCT
      v-else
      message="No hay datos que mostrar"
      description="No se encontró información del historial de pagos."
    />
  </MainCT>

  <!-- Payment Details Drawer (siempre montado; payment=null lo cierra) -->
  <PagoDetallesDrawer
    :payment="detallesPayment"
    :solo-lectura="esConsulta"
    @close="detallesPayment = null"
    @accion="handleAccionPago"
  />

  <!-- Advance Payment Drawer (siempre montado; payment=null lo cierra) -->
  <AdelantarSemanasDrawer
    :payment="adelantarPayment"
    @close="adelantarPayment = null"
    @marcado="handleAdelantoMarcado"
  />

  <!-- Map Display Overlay -->
  <div class="fixed top-0 z-20 h-screen w-screen" v-if="mapMarker">
    <div class="relative h-full w-full">
      <MapWidget :center="[mapMarker.lat, mapMarker.lng]" :marker="mapMarker" readonly @go-back="hideMap" :back="true"
        :zoom="16" class="z-20" />

      <!-- Start Navigation FAB -->
      <button
        type="button"
        @click="startNavigation"
        aria-label="Iniciar navegación en Google Maps hasta la ubicación del pago"
        class="absolute inset-x-0 z-30 mx-auto flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
        style="bottom: max(env(safe-area-inset-bottom), 1.5rem)"
      >
        <NavigationIcon class="h-5 w-5" />
        Iniciar navegación
      </button>
    </div>
  </div>
</template>
