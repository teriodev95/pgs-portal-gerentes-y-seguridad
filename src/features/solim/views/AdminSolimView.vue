<script setup lang="ts">
import { ROUTE_NAME } from '@/router'
import { useApprovalDialog } from '../composables/useApprovalDialog'
import { useSolim } from '../composables/useSolim'
import { SOLIM_STATUS } from '../constants'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Components
import NavbarTop from '@/shared/components/NavbarTop.vue'
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
  <main class="min-h-screen bg-slate-100">
    <!-- Header -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop :label="selectedRequestId ? 'Detalles de Solicitud' : 'Solicitudes'" @on-back="handleOnBack" />
    </div>

    <ActionDialog :is-open="isDialogOpen" :comment="loanApprovalForm.nota"
      :action-type="loanApprovalForm.check" :is-loading="isLoadingLoanRequests || isProcessingAction"
      @update:comment="loanApprovalForm.nota = $event" @confirm="handleConfirmAction" @cancel="closeDialog" />


    <div v-if="hasLoanRequests && !isLoadingLoanRequests" class="space-y-4 p-4">
      <DetailsLoanRequest v-if="selectedRequestId" 
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
      <div v-else class="space-y-4">
        <CardSolim v-for="(loanRequest, index) in loanRequests" :key="index + 1" :solicitud="loanRequest"
          @action:approve="handleApprove" @action:reject="handleReject" @action:details="handleShowDetails" />
      </div>
    </div>

    <LoadSkeleton v-if="isLoadingLoanRequests" :items="6" />
  </main>
</template>