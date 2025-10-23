<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { computed, onMounted, ref } from 'vue'
import { ROUTE_NAME } from '@/router'
import { PaymentSource, RecoverySource } from '@/features/loan/types'

// Composables
import { usePaymentFilters } from '@/features/loan/composables/usePaymentFilter'
import { usePaymentManagement } from '@/features/loan/composables/usePaymentManagement'
import { usePaymentUIState } from '@/features/loan/composables/usePaymentUIState'

// Components
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import PaymentItem from '@/features/loan/components/PaymentItem.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import PaymentEmptyState from '@/features/loan/components/PaymentEmptyState.vue'
import PaymentFilterSection from '@/features/loan/components/PaymentFilterSection.vue'
import PaymentFormBottomSheet from '@/features/loan/components/PaymentFormBottomSheet.vue'
import PaymentSuccessReveal from '@/features/loan/components/PaymentSuccessReveal.vue'

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
  showRevealCircle,
  isFromWeeklyClosureError,
  payments,
  showSuccessReveal,
  handleCancelRevealCircle
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

  if (success) {
    showSuccessReveal()
    paymentFormBottomSheetRef.value?.close()
    paymentFormBottomSheetRef.value?.resetSlide()
  }
}

function handleSelectPayment(payment: any) {
  selectPaymentForProcessing(payment)
  paymentFormBottomSheetRef.value?.open()
}

function onCancelRevealCircle() {
  handleCancelRevealCircle(resetSelectedPayment)
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

  <!-- Success Notification -->
  <PaymentSuccessReveal
    :show="showRevealCircle"
    :selectedPayment="selectedPayment"
    :selectedAmount="selectedAmount"
    @cancel="onCancelRevealCircle"
  />

  <!-- Main Content -->
  <main class="relative min-h-screen space-y-2 bg-slate-100" :class="{ 'overflow-hidden h-screen': showRevealCircle }">

    <!-- Navigation Header -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop :label="isFromWeeklyClosureError ? 'Pagos para habilitar el cierre' : 'Pagos'"
        :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
    </div>

    <!-- Loading State -->
    <LoadSkeleton v-if="isLoadingPayments" :items="6" class="mt-4" />

    <!-- Content State -->
    <SectionContainer v-else>
      <!-- Filter Controls -->
      <PaymentFilterSection
        v-model:filter-value="filterName"
        v-model:filter-check="filterCheck"
        :search-items="filteredPayments"
        @select-item="selectPayment"
      />

      <!-- Payments List -->
      <section class="mt-4 space-y-4">
        <template v-if="filteredPayments.length">
          <PaymentItem v-for="payment in filteredPayments" :key="`payment-${payment.prestamoId}`" :payment="payment"
            :is-processing="isProcessing" @action:select-payment="handleSelectPayment" />
        </template>

        <!-- Empty State -->
        <PaymentEmptyState v-else />
      </section>
    </SectionContainer>
  </main>
</template>