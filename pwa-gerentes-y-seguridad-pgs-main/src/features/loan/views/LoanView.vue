<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { onBeforeMount, computed } from 'vue'
import { toCurrency } from '@/shared/utils'
import { LOAN_FIELD_LABELS, LOAN_SECTION_TITLES, LOAN_HOUSE_NUMBER_FORMAT, LOAN_MODAL_MESSAGES, LOAN_BUTTON_LABELS } from '@/features/loan/constants'

// Composables
import { useLoanData } from '@/features/loan/composables/useLoanData'
import { useNavigation } from '@/features/loan/composables/useNavigation'
import { useModalManager } from '@/features/loan/composables/useModalManager'
import { useSettlementLogic } from '@/features/loan/composables/useSettlementLogic'

// Components
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import LoanSummaryCard from '@/features/loan/components/LoanSummaryCard.vue'
import LoanDataSection from '@/features/loan/components/LoanDataSection.vue'

// Composables initialization
const loanDataComposable = useLoanData()
const navigationComposable = useNavigation()
const modalManagerComposable = useModalManager()
const settlementLogicComposable = useSettlementLogic(modalManagerComposable, navigationComposable)

// Destructure composables
const {
  isLoading,
  loanData,
  settlementData,
  clientFullName,
  avalFullName,
  weeklyPayment,
  isSettlementButtonDisabled,
  isWeeklyFeePaid,
  initializeLoanData
} = loanDataComposable

const {
  isRegionalButtonDisabled,
  navigationBackPath,
  navigateToPaymentHistory
} = navigationComposable

const {
  confirmId,
  modalInfo,
  notificationBottomSheet,
  settlementOptionsBottomSheet,
  closeNotificationSheet,
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

// Computed properties for data sections
const generalDataItems = computed(() => {
  if (!loanData.value) return []
  return [
    { label: LOAN_FIELD_LABELS.AGENT, value: loanData.value.agente },
    { label: LOAN_FIELD_LABELS.CLIENT_ID, value: loanData.value.clienteId },
    { label: LOAN_FIELD_LABELS.MANAGER, value: loanData.value.gerenteEnTurno },
    { label: LOAN_FIELD_LABELS.DELIVERY, value: toCurrency(loanData.value.montoOtorgado) }
  ]
})

const clientDataItems = computed(() => {
  if (!loanData.value) return []
  return [
    { label: LOAN_FIELD_LABELS.NAME, value: clientFullName.value },
    { label: LOAN_FIELD_LABELS.NEIGHBORHOOD, value: loanData.value.colonia },
    { label: LOAN_FIELD_LABELS.STREET, value: loanData.value.direccion, rightAligned: true },
    { 
      label: LOAN_FIELD_LABELS.HOUSE_NUMBERS, 
      value: `<span class="space-x-2">${loanData.value.noExterior ? `<span>${LOAN_HOUSE_NUMBER_FORMAT.EXTERIOR} ${loanData.value.noExterior}</span>` : ''}${loanData.value.noInterior ? `<span>${LOAN_HOUSE_NUMBER_FORMAT.INTERIOR} ${loanData.value.noInterior}</span>` : ''}</span>`,
      show: !!(loanData.value.noExterior || loanData.value.noInterior)
    },
    { label: LOAN_FIELD_LABELS.PHONE, value: loanData.value.telefonoCliente },
    { label: LOAN_FIELD_LABELS.LEVEL, value: loanData.value.tipoDeCliente },
    { label: LOAN_FIELD_LABELS.GRANTED, value: toCurrency(loanData.value.montoOtorgado) }
  ]
})

const guarantorDataItems = computed(() => {
  if (!loanData.value) return []
  return [
    { label: LOAN_FIELD_LABELS.GUARANTOR_NAME, value: avalFullName.value },
    { label: LOAN_FIELD_LABELS.GUARANTOR_NEIGHBORHOOD, value: loanData.value.coloniaAval },
    { label: LOAN_FIELD_LABELS.GUARANTOR_STREET, value: loanData.value.direccionAval, rightAligned: true },
    { 
      label: LOAN_FIELD_LABELS.GUARANTOR_HOUSE_NUMBERS, 
      value: `<span class="space-x-2">${loanData.value.noExteriorAval ? `<span>${LOAN_HOUSE_NUMBER_FORMAT.EXTERIOR} ${loanData.value.noExteriorAval}</span>` : ''}${loanData.value.noInteriorAval ? `<span>${LOAN_HOUSE_NUMBER_FORMAT.INTERIOR} ${loanData.value.noInteriorAval}</span>` : ''}</span>`,
      show: !!(loanData.value.noExteriorAval || loanData.value.noInteriorAval)
    },
    { label: LOAN_FIELD_LABELS.GUARANTOR_PHONE, value: loanData.value.telefonoAval }
  ]
})

const loanDataItems = computed(() => {
  if (!loanData.value) return []
  return [
    { label: LOAN_FIELD_LABELS.DELIVERY_DATE, value: `${loanData.value.semana}/${loanData.value.anio}` },
    { label: LOAN_FIELD_LABELS.LOAN_ID, value: loanData.value.prestamoId },
    { label: LOAN_FIELD_LABELS.WEEK, value: loanData.value.semana },
    { label: LOAN_FIELD_LABELS.PAYMENT_DAY, value: loanData.value.diaDePago },
    { label: LOAN_FIELD_LABELS.TERM, value: loanData.value.plazo },
    { label: LOAN_FIELD_LABELS.CHARGES, value: toCurrency(loanData.value.cargo) },
    { label: LOAN_FIELD_LABELS.TOTAL_TO_PAY, value: toCurrency(loanData.value.totalAPagar) },
    { label: LOAN_FIELD_LABELS.FIRST_PAYMENT, value: toCurrency(loanData.value.primerPago) },
    { label: LOAN_FIELD_LABELS.WEEKLY_PAYMENT, value: toCurrency(loanData.value.tarifa) },
    { label: LOAN_FIELD_LABELS.BALANCE_LOAN, value: toCurrency(loanData.value.saldo) },
    { label: LOAN_FIELD_LABELS.COLLECTED_LOAN, value: toCurrency(loanData.value.cobrado) }
  ]
})

// Lifecycle
onBeforeMount(initializeLoanData)
</script>

<template>
  <!-- Modals -->
  <ConfirmModal :title="modalInfo.title" :message="modalInfo.message" :id="confirmId" />

  <!-- Weekly Fee Notification Bottom Sheet -->
  <vue-bottom-sheet ref="notificationBottomSheet" :max-width="1000" :max-height="1500">
    <div class="p-4 space-y-4">
      <div class="space-y-2">
        <h1 class="title">{{ LOAN_MODAL_MESSAGES.WEEKLY_FEE_NOT_PAID.title }}</h1>
        <h2 class="subtitle">
          {{ LOAN_MODAL_MESSAGES.WEEKLY_FEE_NOT_PAID.message
            .replace('{tarifa}', toCurrency(loanData?.tarifa || 0))
            .replace('{weeklyPayment}', toCurrency(weeklyPayment || 0)) }}
        </h2>
      </div>

      <button @click="closeNotificationSheet" class="btn btn-primary w-full">
        {{ LOAN_BUTTON_LABELS.UNDERSTOOD }}
      </button>
    </div>
  </vue-bottom-sheet>

  <!-- Settlement Options Bottom Sheet -->
  <vue-bottom-sheet ref="settlementOptionsBottomSheet" :max-width="1000" :max-height="1500">
    <div class="p-4 space-y-4">
      <h1 class="title">{{ LOAN_MODAL_MESSAGES.SETTLEMENT_OPTIONS.title }}</h1>
      <h2 class="subtitle">{{ LOAN_MODAL_MESSAGES.SETTLEMENT_OPTIONS.message }}</h2>

      <div class="space-y-2">
        <button @click="onNavigateToSettlements" class="btn btn-primary w-full">
          {{ LOAN_BUTTON_LABELS.SETTLEMENT_WITH_DISCOUNT }}
        </button>
        <button @click="onSettleWithoutDiscount" class="btn btn-primary-outline w-full">
          {{ LOAN_BUTTON_LABELS.SETTLEMENT_WITHOUT_DISCOUNT }}
        </button>
      </div>
    </div>
  </vue-bottom-sheet>

  <!-- Main Content -->
  <main class="min-h-screen bg-slate-100">
    <!-- Header -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Préstamo" :back="navigationBackPath" />
    </div>

    <!-- Loan Summary -->
    <div class="p-2" v-if="loanData">
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
      <div class="text-[0.95rem]">
        <LoanDataSection :title="LOAN_SECTION_TITLES.GENERAL_DATA" :items="generalDataItems" />
        <LoanDataSection :title="LOAN_SECTION_TITLES.CLIENT_DATA" :items="clientDataItems" />
        <LoanDataSection :title="LOAN_SECTION_TITLES.GUARANTOR_DATA" :items="guarantorDataItems" />
        <LoanDataSection :title="LOAN_SECTION_TITLES.LOAN_DATA" :items="loanDataItems" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading">
      <LoadSkeleton :items="8" />
    </div>

    <!-- Empty State -->
    <div v-else class="p-4 text-center text-xl font-bold text-blue-900">
      No hay datos que mostrar
    </div>
  </main>
</template>