<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { LOAN_SECTION_TITLES, LOAN_BUTTON_LABELS } from '@/features/loan/constants'

// Composables
import { useLoanData } from '@/features/loan/composables/useLoanData'
import { useNavigation } from '@/features/loan/composables/useNavigation'
import { useModalManager } from '@/features/loan/composables/useModalManager'
import { useSettlementLogic } from '@/features/loan/composables/useSettlementLogic'

const router = useRouter()

// Components
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import LoanSummaryCard from '@/features/loan/components/LoanSummaryCard.vue'
import LoanDataSection from '@/features/loan/components/LoanDataSection.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import WeeklyFeeDrawer from '@/features/loan/components/WeeklyFeeDrawer.vue'
import SettlementOptionsDrawer from '@/features/loan/components/SettlementOptionsDrawer.vue'

// Composables initialization
const loanDataComposable = useLoanData()
const navigationComposable = useNavigation()
const modalManagerComposable = useModalManager()
const settlementLogicComposable = useSettlementLogic(modalManagerComposable)

// Destructure composables
const {
  isLoading,
  loanData,
  settlementData,
  isSettlementButtonDisabled,
  isWeeklyFeePaid,
  initializeLoanData,
  generalDataItems,
  clientDataItems,
  guarantorDataItems,
  loanDataItems
} = loanDataComposable

const {
  isRegionalButtonDisabled,
  navigationBackPath,
  navigateToPaymentHistory,
  navigateToSpecialSettlement
} = navigationComposable

const {
  confirmId,
  modalInfo
} = modalManagerComposable

const {
  handleSettlementRequest,
  handleSettleWithoutDiscount,
  handleNavigateToSettlements
} = settlementLogicComposable


// Component-specific methods
function onSettlementRequest() {
  handleSettlementRequest(loanData.value, isWeeklyFeePaid)
}

function onSettleWithoutDiscount() {
  handleSettleWithoutDiscount(modalManagerComposable)
}

function onNavigateToSettlements() {
  handleNavigateToSettlements(
    settlementData.value,
    loanData.value,
    modalManagerComposable,
    navigationComposable
  )
}

function onNavigateToPaymentHistory() {
  navigateToPaymentHistory(loanData.value)
}

function onNavigateToSpecialSettlement() {
  navigateToSpecialSettlement(loanData.value)
}

function handleBack() {
  if (navigationBackPath.value === true) {
    router.back()
  } else {
    router.push(navigationBackPath.value)
  }
}

// Lifecycle
onBeforeMount(initializeLoanData)
</script>

<template>
  <!-- Modals -->
  <ConfirmModal :title="modalInfo.title" :message="modalInfo.message" :id="confirmId" />

  <!-- Drawers -->
  <WeeklyFeeDrawer />
  <SettlementOptionsDrawer
    @navigate-to-settlements="onNavigateToSettlements"
    @settle-without-discount="onSettleWithoutDiscount"
  />

  <!-- Main Content -->
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Préstamo"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Loan Summary -->
    <SectionContainer v-if="loanData && !isLoading">
      <LoanSummaryCard
        :cobrado="loanData.cobrado"
        :saldo="loanData.saldo"
        :porcentaje-cobrado="loanData.porcentajeCobrado"
        :client-name="loanData.nombres"
        :status="loanData.status"
        :is-regional-button-disabled="isRegionalButtonDisabled"
        :is-settlement-button-disabled="isSettlementButtonDisabled"
        @navigate-to-history="onNavigateToPaymentHistory"
        @settlement-request="onSettlementRequest"
      />

      <!-- Detailed Information -->
      <LoanDataSection :title="LOAN_SECTION_TITLES.GENERAL_DATA" :items="generalDataItems" />
      <LoanDataSection :title="LOAN_SECTION_TITLES.CLIENT_DATA" :items="clientDataItems" />
      <LoanDataSection :title="LOAN_SECTION_TITLES.GUARANTOR_DATA" :items="guarantorDataItems" />
      <LoanDataSection :title="LOAN_SECTION_TITLES.LOAN_DATA" :items="loanDataItems" />

       <!-- Special Settlement Button -->
      <CardContainer title="Liquidaciones especiales">
        <TextCT variante="primary">
          Utiliza esta opción para gestionar y saldar préstamos con más de un año de antigüedad, aplicando condiciones especiales de liquidación.
        </TextCT>

        <BtnComponent
          variant="primary"
          full-width
          @click="onNavigateToSpecialSettlement"
          :disabled="isSettlementButtonDisabled"
        >
          {{ LOAN_BUTTON_LABELS.SPECIAL_SETTLEMENT }}
        </BtnComponent>
      </CardContainer>
    </SectionContainer>

    <!-- Loading State -->
    <LoadSkeleton v-else-if="isLoading" :items="8" />

    <!-- Empty State -->
    <EmptyCT
      v-else
      message="No hay datos que mostrar"
      description="No se encontró información del préstamo solicitado."
    />
  </MainCT>
</template>