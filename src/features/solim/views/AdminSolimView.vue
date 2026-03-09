<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { SlidersHorizontal } from 'lucide-vue-next'
import { ROUTE_NAME } from '@/router'
import { useApprovalDialog } from '../composables/useApprovalDialog'
import { useSolim } from '../composables/useSolim'

import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import ActionDialog from '../components/ActionDialog.vue'
import AgencyFilterSheet from '../components/AgencyFilterSheet.vue'
import CardSolim from '../components/CardSolim.vue'
import DetailsLoanRequest from '../components/DetailsLoanRequest.vue'

const router = useRouter()
const { loanApprovalForm, isDialogOpen, selectedRequestId: dialogRequestId, openDialog, closeDialog } =
  useApprovalDialog()

const {
  loanRequests,
  selectedLoanRequest,
  tablaCargosOptions,
  selectedAgency,
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
  setSelectedAgency,
  selectLoanRequest,
  clearSelectedLoanRequest
} = useSolim()

const selectedRequestId = ref<string | null>(null)
const agencyFilterSheetRef = ref<InstanceType<typeof AgencyFilterSheet>>()

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

function handleOpenDialog(id: string): void {
  const request =
    (selectedLoanRequest.value?.id === id
      ? selectedLoanRequest.value
      : loanRequests.value.find((item) => item.id === id)) ??
    null

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

async function handleConfirmAction(): Promise<void> {
  if (!dialogRequestId.value) {
    return
  }

  await saveApproval(loanApprovalForm.value, dialogRequestId.value)
  closeDialog()
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
</script>

<template>
  <ActionDialog
    :is-open="isDialogOpen"
    :form="loanApprovalForm"
    :role-label="currentRoleLabel"
    :tabla-cargos-options="tablaCargosOptions"
    :current-plan-id="selectedLoanRequest?.revision?.tabla_cargos_id_sugerido ?? selectedLoanRequest?.tabla_cargos_id ?? null"
    :is-loading="isProcessingAction"
    @update:form="handleUpdateForm"
    @confirm="handleConfirmAction"
    @cancel="closeDialog"
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

    <div v-if="!isDetailVisible" class="p-4 pb-0">
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
        @open:review="handleOpenDialog(selectedLoanRequest.id)"
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
