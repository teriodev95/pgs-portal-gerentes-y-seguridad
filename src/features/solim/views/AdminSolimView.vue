<script setup lang="ts">
import { ROUTE_NAME } from '@/router'
import { useApprovalDialog } from '../composables/useApprovalDialog'
import { useSolim } from '../composables/useSolim'
import { SOLIM_STATUS } from '../constants'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Components
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import CardSolim from '../components/CardSolim.vue';
import ActionDialog from '../components/ActionDialog.vue';
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue';
import DetailsLoanRequest from '../components/DetailsLoanRequest.vue';

const $router = useRouter()
const { loanApprovalForm, isDialogOpen, openDialog, closeDialog, confirmAction } = useApprovalDialog()
const {
  addressInfo,
  analysisCreditInfo,
  checksInfo,
  clientDocuments,
  clientInfo,
  creditInfo,
  guarantorDocuments,
  guarantorInfo,
  hasLoanRequests,
  isLoadingLoanRequests,
  isProcessingAction,
  loanRequests,
  scheduleInfo,
  approveLoanRequest,
  rejectLoanRequest,
  selectLoanRequest,
  clearSelectedLoanRequest
} = useSolim()

const selectedRequestId = ref<string | null>(null)

const handleApprove = (id: string) => {
  openDialog(id, SOLIM_STATUS.APPROVED)
}

const handleReject = (id: string) => {
  openDialog(id, SOLIM_STATUS.REJECTED)
}

const handleShowDetails = (id: string) => {
  if (selectedRequestId.value === id) {
    selectedRequestId.value = null
    clearSelectedLoanRequest()
  } else {
    selectedRequestId.value = id
    selectLoanRequest(id)
  }
}

const handleOnBack = () => {
  if (selectedRequestId.value) {
    selectedRequestId.value = null
    clearSelectedLoanRequest()
    return
  }

  $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}

const handleConfirmAction = async () => {
  await confirmAction(approveLoanRequest, rejectLoanRequest)
}
</script>

<template>
  <!-- Action Dialog -->
  <ActionDialog
    :is-open="isDialogOpen"
    :comment="loanApprovalForm.nota"
    :action-type="loanApprovalForm.check"
    :is-loading="isLoadingLoanRequests || isProcessingAction"
    @update:comment="loanApprovalForm.nota = $event"
    @confirm="handleConfirmAction"
    @cancel="closeDialog"
  />

  <!-- Main Content -->
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      :title="selectedRequestId ? 'Detalles de Solicitud' : 'Solicitudes'"
      :show-back-button="true"
      @back="handleOnBack"
    />

    <!-- Loading State -->
    <LoadSkeleton v-if="isLoadingLoanRequests" :items="6" />

    <!-- Content with Requests -->
    <div v-else-if="hasLoanRequests" class="space-y-4 p-4">
      <!-- Loan Request Details View -->
      <DetailsLoanRequest
        v-if="selectedRequestId"
        :analysis-credit-info="analysisCreditInfo"
        :client-info="clientInfo"
        :client-documents="clientDocuments"
        :address-info="addressInfo"
        :guarantor-info="guarantorInfo"
        :guarantor-documents="guarantorDocuments"
        :credit-info="creditInfo"
        :schedule-info="scheduleInfo"
        :checks="checksInfo"
      />

      <!-- Loan Requests List View -->
      <div v-else class="space-y-4">
        <CardSolim
          v-for="(loanRequest, index) in loanRequests"
          :key="index + 1"
          :solicitud="loanRequest"
          @action:approve="handleApprove"
          @action:reject="handleReject"
          @action:details="handleShowDetails"
        />
      </div>
    </div>

    <!-- Empty State -->
    <EmptyCT
      v-else
      message="No hay solicitudes pendientes"
      description="No se encontraron solicitudes de préstamo para revisar en este momento."
    />
  </MainCT>
</template>