<script setup lang="ts">
import type { INoPago, IVisita } from '../types'
import type { LatLng } from 'leaflet'

// Components
import NoPaymentCard from './NoPaymentCard.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'

interface Props {
  noPayments: INoPago[]
  isLoading: boolean
  hasPaymentsFiltered: boolean
}

interface Emit {
  (e: 'click:map-market', coordinates: LatLng): void
  (e: 'click:visit-selected', visit: IVisita): void
}

defineProps<Props>()
const emit = defineEmits<Emit>()

function handleMapMarker(coordinates: LatLng) {
  emit('click:map-market', coordinates)
}

function handleVisitSelected(visit: IVisita) {
  emit('click:visit-selected', visit)
}
</script>

<template>
  <div v-if="!isLoading">
    <EmptyCT v-if="!hasPaymentsFiltered" message="No se encontraron *NO pagos* que coincidan con los filtros seleccionados." />


    <!-- No Payments List -->
    <div class="space-y-2" v-else>
      <NoPaymentCard v-for="payment in noPayments" :key="payment.pagoId" :pago="payment"
        @click:map-market="handleMapMarker" @click:visit-selected="handleVisitSelected" />
    </div>
  </div>

  <!-- Loading State -->
  <LoadSkeleton v-else :items="6" class="mt-4" />
</template>