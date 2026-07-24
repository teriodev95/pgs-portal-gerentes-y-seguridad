<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { ROUTE_NAME } from '@/router'
import { useRoute, useRouter } from 'vue-router'
import { latLng } from 'leaflet'
import type { IPayment } from '../types'
import { usePaymentHistory } from '../composables'

// Components
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import MapWidget from '@/shared/components/MapWidget.vue'
import NavigationIcon from '@/shared/components/icons/NavigationIcon.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import PaymentAccordion from '@/features/payment-details/components/PaymentAccordion.vue'
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
  loadLoanHistory,
  hideMap,
  showMap,
  startNavigation
} = usePaymentHistory()

// Drawers: "Ver detalles" concentra las acciones del pago; desde ahí puede
// abrirse el flujo de adelantar semanas (un drawer a la vez).
const detallesPayment = ref<IPayment | null>(null)
const adelantarPayment = ref<IPayment | null>(null)

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

async function handleAdelantoMarcado() {
  // Refresca el historial en segundo plano (Immediate Feedback: el drawer de
  // éxito sigue visible; al cerrarlo la lista ya trae el chip de adelantado).
  const loanId = route.query.prestamo as string
  if (loanId) {
    await loadLoanHistory(loanId)
  }
}

function handleBack() {
  $router.push({
    name: ROUTE_NAME.DASHBOARD_PRESTAMO,
    query: { prestamo: loanData.value?.prestamoId }
  })
}

// Lifecycle hooks
onBeforeMount(async () => {
  const loanId = route.query.prestamo as string
  if (loanId) {
    await loadLoanHistory(loanId)
  }
})
</script>

<template>
  <!-- Main Content -->
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Historial"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Loan Data Display -->
    <SectionContainer v-if="loanData && !isLoading">
      <!-- General Information Card -->
      <LoanGeneralInfo :loan-data="loanData" />

      <!-- History Items List -->
      <PaymentAccordion
        :historial-list="historyList"
        @ver-detalles="handleVerDetalles"
        @adelantar="handleAdelantar"
      />
    </SectionContainer>

    <!-- Loading State -->
    <LoadSkeleton v-else-if="isLoading" :items="9" />

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
