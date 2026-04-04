<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { ROUTE_NAME } from '@/router'
import { useApprovalDialog } from '../composables/useApprovalDialog'
import { useSolim } from '../composables/useSolim'
import { useStore } from '@/shared/stores'
import type { RevisionApproval } from '../types'

import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import ActionDialog from '../components/ActionDialog.vue'
import GarantiasDialog from '../components/GarantiasDialog.vue'
import AgencyFilterSheet from '../components/AgencyFilterSheet.vue'
import CardSolim from '../components/CardSolim.vue'
import DetailsLoanRequest from '../components/DetailsLoanRequest.vue'

const router = useRouter()
const $store = useStore()
const { loanApprovalForm, isDialogOpen, selectedRequestId: dialogRequestId, selectedApprovalType: dialogApprovalType, openDialog, closeDialog } =
  useApprovalDialog()

const {
  loanRequests,
  selectedLoanRequest,
  tablaCargosOptions,
  selectedAgency,
  selectedWeek,
  isLoadingLoanRequests,
  isLoadingSelectedLoanRequest,
  isProcessingAction,
  hasLoanRequests,
  loanRequestsCount,
  currentApproval,
  currentApprovalType,
  currentRoleLabel,
  canApproveSelected,
  availableAgencies,
  saveApproval,
  saveGarantiasCheck,
  setSelectedAgency,
  setSelectedWeek,
  selectLoanRequest,
  clearSelectedLoanRequest
} = useSolim()

const selectedRequestId = ref<string | null>(null)
const agencyFilterSheetRef = ref<InstanceType<typeof AgencyFilterSheet>>()

const isGarantiasDialogOpen = ref(false)
const garantiasDialogRequestId = ref<string>()
const garantiasCurrentApproval = ref<RevisionApproval | null>(null)

const isDetailVisible = computed(() => Boolean(selectedRequestId.value))
const selectedAgencyLabel = computed(() =>
  selectedAgency.value === 'all' ? 'Todas las agencias' : selectedAgency.value
)

async function handleShowDetails(id: string): Promise<void> {
  if (selectedRequestId.value === id) {
    selectedRequestId.value = null
    clearSelectedLoanRequest()
    return
  }

  selectedRequestId.value = id
  await selectLoanRequest(id)
}

function findRequest(id: string) {
  return (selectedLoanRequest.value?.id === id
    ? selectedLoanRequest.value
    : loanRequests.value.find((item) => item.id === id)) ?? null
}

function handleOpenDialog(id: string): void {
  const request = findRequest(id)
  openDialog({
    requestId: id,
    currentApproval:
      request?.revision_aprobaciones?.find((approval) => approval.tipo === currentApprovalType.value) ??
      request?.revision?.aprobaciones?.find((approval) => approval.tipo === currentApprovalType.value) ??
      currentApproval.value ??
      null,
    currentPlanId: request?.revision?.tabla_cargos_id_sugerido ?? request?.tabla_cargos_id ?? null
  })
}

function handleOpenGarantiasDialog(id: string): void {
  const request = findRequest(id)
  garantiasDialogRequestId.value = id
  garantiasCurrentApproval.value =
    request?.revision_aprobaciones?.find((a) => a.tipo === 'garantias') ??
    request?.revision?.aprobaciones?.find((a) => a.tipo === 'garantias') ??
    null
  isGarantiasDialogOpen.value = true
}

async function handleConfirmAction(): Promise<void> {
  if (!dialogRequestId.value) {
    return
  }

  await saveApproval(loanApprovalForm.value, dialogRequestId.value, dialogApprovalType.value)
  closeDialog()
}

async function handleConfirmGarantias(payload: { decision: 'aprobado' | 'rechazado', comentario: string }): Promise<void> {
  if (!garantiasDialogRequestId.value) return
  try {
    await saveGarantiasCheck(garantiasDialogRequestId.value, payload)
    closeGarantiasDialog()
  } catch {
    // Dialog permanece abierto, el error ya se muestra en saveGarantiasCheck
  }
}

function closeGarantiasDialog(): void {
  isGarantiasDialogOpen.value = false
  garantiasDialogRequestId.value = undefined
  garantiasCurrentApproval.value = null
}

function handleBack(): void {
  if (selectedRequestId.value) {
    selectedRequestId.value = null
    clearSelectedLoanRequest()
    return
  }

  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}

function handleUpdateForm(nextForm: typeof loanApprovalForm.value): void {
  loanApprovalForm.value = nextForm
}

async function handleAgencyChange(agency: string): Promise<void> {
  if (agency === selectedAgency.value) {
    return
  }

  selectedRequestId.value = null
  await setSelectedAgency(agency)
}

function openAgencyFilter(): void {
  agencyFilterSheetRef.value?.open()
}

function handlePrevWeek(): void {
  const next = selectedWeek.value - 1
  if (next >= 1) {
    setSelectedWeek(next)
  }
}

function handleNextWeek(): void {
  const next = selectedWeek.value + 1
  if (next <= $store.currentDate.week) {
    setSelectedWeek(next)
  }
}
</script>

<template>
  <ActionDialog
    :is-open="isDialogOpen"
    :form="loanApprovalForm"
    :role-label="dialogApprovalType === 'garantias' ? 'Garantías' : currentRoleLabel"
    :tabla-cargos-options="tablaCargosOptions"
    :current-plan-id="selectedLoanRequest?.revision?.tabla_cargos_id_sugerido ?? selectedLoanRequest?.tabla_cargos_id ?? null"
    :is-loading="isProcessingAction"
    @update:form="handleUpdateForm"
    @confirm="handleConfirmAction"
    @cancel="closeDialog"
  />

  <GarantiasDialog
    :is-open="isGarantiasDialogOpen"
    :cliente-activos="selectedLoanRequest?.cliente_activos ?? null"
    :aval-activos="selectedLoanRequest?.aval_activos ?? null"
    :current-approval="garantiasCurrentApproval"
    :is-loading="isProcessingAction"
    @confirm="handleConfirmGarantias"
    @cancel="closeGarantiasDialog"
  />

  <AgencyFilterSheet
    ref="agencyFilterSheetRef"
    :agencies="availableAgencies"
    :selected-agency="selectedAgency"
    @select="handleAgencyChange"
  />

  <MainCT>
    <NavbarCT
      :title="isDetailVisible ? `Detalle de ${currentRoleLabel}` : `Solicitudes ${currentRoleLabel}`"
      :show-back-button="true"
      @back="handleBack"
    />

    <div v-if="!isDetailVisible" class="p-4 pb-0 space-y-3">
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        @click="openAgencyFilter"
      >
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Agencia</p>
          <p class="mt-1 truncate text-base font-semibold text-slate-900">{{ selectedAgencyLabel }}</p>
          <p class="mt-1 text-sm text-slate-500">
            {{ loanRequestsCount }} solicitud{{ loanRequestsCount === 1 ? '' : 'es' }} en esta vista
          </p>
        </div>
        <span class="ml-4 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
          <SlidersHorizontal class="size-5" />
        </span>
      </button>

      <div class="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
          :disabled="selectedWeek <= 1"
          @click="handlePrevWeek"
        >
          <ChevronLeft class="size-5" />
        </button>
        <p class="text-center">
          <span class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Semana</span>
          <span class="ml-2 text-base font-bold text-slate-900">{{ selectedWeek }}</span>
        </p>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
          :disabled="selectedWeek >= $store.currentDate.week"
          @click="handleNextWeek"
        >
          <ChevronRight class="size-5" />
        </button>
      </div>
    </div>

    <LoadSkeleton v-if="isLoadingLoanRequests && !isDetailVisible" :items="5" />

    <div v-else-if="hasLoanRequests || isDetailVisible" class="space-y-4 p-4">
      <div
        v-if="isDetailVisible && isLoadingSelectedLoanRequest"
        class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
      >
        <LoadSkeleton :items="2" />
      </div>

      <DetailsLoanRequest
        v-else-if="selectedLoanRequest"
        :request="selectedLoanRequest"
        :approval-type="currentApprovalType"
        :role-label="currentRoleLabel"
        :can-register-decision="canApproveSelected"
        :is-loading-action="isProcessingAction"
        @open:review="(type) => type === 'garantias' ? handleOpenGarantiasDialog(selectedLoanRequest!.id) : handleOpenDialog(selectedLoanRequest!.id)"
      />

      <div v-else class="space-y-4">
        <div class="rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p class="text-sm font-medium text-slate-600">
            Se muestran solo las solicitudes pendientes que requieren revisión de {{ currentRoleLabel.toLowerCase() }}.
          </p>
        </div>

        <CardSolim
          v-for="loanRequest in loanRequests"
          :key="loanRequest.id"
          :solicitud="loanRequest"
          :approval-type="currentApprovalType"
          @action:details="handleShowDetails"
          @action:review="handleOpenDialog"
        />
      </div>
    </div>

    <EmptyCT
      v-else
      message="No hay solicitudes pendientes"
      :description="`No se encontraron solicitudes pendientes para ${currentRoleLabel.toLowerCase()}.`"
    />
  </MainCT>
</template>
