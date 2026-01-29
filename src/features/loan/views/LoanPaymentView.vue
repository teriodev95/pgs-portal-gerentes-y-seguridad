<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { PaymentSource, RecoverySource } from '@/features/loan/types'

// Composables
import { usePaymentFilters } from '@/features/loan/composables/usePaymentFilter'
import { usePaymentManagement } from '@/features/loan/composables/usePaymentManagement'
import { usePaymentUIState } from '@/features/loan/composables/usePaymentUIState'

// Components
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import PaymentItem from '@/features/loan/components/PaymentItem.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import PaymentFilterSection from '@/features/loan/components/PaymentFilterSection.vue'
import PaymentFormBottomSheet from '@/features/loan/components/PaymentFormBottomSheet.vue'

const router = useRouter()

// Composables initialization

const {
  filterName,
  filterCheck,
  getFilteredPayments,
  selectPayment
} = usePaymentFilters()

const {
  isLoadingPayments,
  isProcessing,
  selectedAmount,
  selectedPayment,
  loadPayments,
  processPayment,
  selectPaymentForProcessing,
  resetSelectedPayment
} = usePaymentManagement()

const {
  isFromWeeklyClosureError,
  payments,
  showSuccessReveal
} = usePaymentUIState()

// Computed properties
const filteredPayments = computed(() => getFilteredPayments(payments.value))
const paymentFormBottomSheetRef = ref()
const paymentForm = ref({
  amount: 1,
  paymentSource: PaymentSource.CLIENT,
  paymentRecovery: RecoverySource.AGENT,
});

// Enhanced handlers
async function handlePayment() {
  const success = await processPayment(paymentForm.value.amount, paymentForm.value.paymentSource, paymentForm.value.paymentRecovery)

  if (success && selectedPayment.value) {
    showSuccessReveal(selectedPayment.value, selectedAmount.value)
    paymentFormBottomSheetRef.value?.close()
    paymentFormBottomSheetRef.value?.resetSlide()
    resetSelectedPayment()
  }
}

function handleSelectPayment(payment: any) {
  selectPaymentForProcessing(payment)
  paymentFormBottomSheetRef.value?.open()
}

function handleBack() {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}

// Lifecycle hooks
onMounted(async () => {
  if (!isFromWeeklyClosureError.value) {
    await loadPayments()
  }
})
</script>

<template>
  <!-- Payment Form Bottom Sheet -->
  <PaymentFormBottomSheet
    ref="paymentFormBottomSheetRef"
    v-model:payment-form="paymentForm"
    :selectedPayment="selectedPayment"
    :isProcessing="isProcessing"
    @submit="handlePayment"
    @completed="handlePayment"
  />

  <!-- Main Content -->
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      :title="isFromWeeklyClosureError ? 'Pagos para habilitar el cierre' : 'Pagos'"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Loading State -->
    <LoadSkeleton v-if="isLoadingPayments" :items="6" class="mt-4" />

    <!-- Content State -->
    <SectionContainer v-else-if="filteredPayments.length > 0">
      <!-- Filter Controls -->
      <PaymentFilterSection
        v-model:filter-value="filterName"
        v-model:filter-check="filterCheck"
        :search-items="filteredPayments"
        @select-item="selectPayment"
      />

      <!-- Payments List -->
      <section class="mt-4 space-y-4">
        <PaymentItem
          v-for="payment in filteredPayments"
          :key="`payment-${payment.prestamoId}`"
          :payment="payment"
          :is-processing="isProcessing"
          @action:select-payment="handleSelectPayment"
        />
      </section>
    </SectionContainer>

    <!-- Empty State -->
    <EmptyCT
      v-else
      message="No hay pagos disponibles"
      description="No se encontraron pagos para mostrar en este momento."
    />
  </MainCT>
</template>