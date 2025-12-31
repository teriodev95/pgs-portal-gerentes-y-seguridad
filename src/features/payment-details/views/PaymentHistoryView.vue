<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { ROUTE_NAME } from '@/router'
import { useRoute, useRouter } from 'vue-router'
import { latLng } from 'leaflet'
import type { IPayment } from '../types'
import { usePaymentHistory } from '../composables'

// Components
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import MapWidget from '@/shared/components/MapWidget.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import PaymentAccordion from '@/features/payment-details/components/PaymentAccordion.vue'
import LoanGeneralInfo from '@/features/payment-details/components/LoanGeneralInfo.vue'
import EmptyState from '@/features/payment-details/components/EmptyState.vue'

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
  showMap
} = usePaymentHistory()

// Methods
function handlePaymentAction(action: 'showMap' | 'correction', payment: IPayment) {
  if (action === 'showMap') {
    if (!payment.lat || !payment.lng) return
    const position = latLng(payment.lat, payment.lng)
    showMap(position)
  } else if (action === 'correction') {
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

// Lifecycle hooks
onBeforeMount(async () => {
  const loanId = route.query.prestamo as string
  if (loanId) {
    await loadLoanHistory(loanId)
  }
})
</script>

<template>
  <main class="min-h-screen bg-slate-100">
    <!-- Header Navigation -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Historial"
        :back="{ name: ROUTE_NAME.DASHBOARD_PRESTAMO, query: { prestamo: loanData?.prestamoId } }" />
    </div>

    <!-- Loan Data Display -->
    <SectionContainer class="p-2" v-if="loanData">
      <!-- General Information Card -->
      <LoanGeneralInfo :loan-data="loanData" />

      <!-- History Items List -->
      <PaymentAccordion :historial-list="historyList" @payment-action="handlePaymentAction" />
    </SectionContainer>

    <!-- Loading State -->
    <div class="mt-2" v-else-if="isLoading">
      <LoadSkeleton :items="9" />
    </div>

    <!-- Empty State -->
    <EmptyState v-else title="No hay datos que mostrar" />
  </main>

  <!-- Map Display Overlay -->
  <div class="fixed top-0 z-20 h-screen w-screen" v-if="mapMarker">
    <div class="relative h-full w-full">
      <MapWidget :center="[mapMarker.lat, mapMarker.lng]" :marker="mapMarker" readonly @go-back="hideMap" :back="true"
        :zoom="16" class="z-20" />
    </div>
  </div>
</template>