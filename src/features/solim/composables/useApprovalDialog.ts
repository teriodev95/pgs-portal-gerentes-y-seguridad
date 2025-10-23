import { ref, computed } from 'vue'
import { SOLIM_STATUS, type SolimStatusType } from '../constants'
import type { CheckInfo } from '../types'


export function useApprovalDialog() {
  const selectedRequestId = ref<string>()
  const loanApprovalForm = ref<CheckInfo>({
    check: null,
    check_date: null,
    check_by: null,
    nota: ""
  })

  const isDialogOpen = ref(false)
  const currentAction = ref<'approve' | 'reject' | null>(null)
  const isApprovalAction = computed(() => currentAction.value === 'approve')
  const isRejectionAction = computed(() => currentAction.value === 'reject')

  const openApprovalDialog = () => {
    loanApprovalForm.value.check = 'checked'
    currentAction.value = 'approve'
  }

  const openRejectionDialog = () => {
    loanApprovalForm.value.check = null
    currentAction.value = 'reject'
  }

  const openDialog = (id: string, status: SolimStatusType) => {
    if (status === SOLIM_STATUS.APPROVED) {
      openApprovalDialog()
    } else {
      openRejectionDialog()
    }
    selectedRequestId.value = id
    isDialogOpen.value = true
  }

  const closeDialog = () => {
    isDialogOpen.value = false
    currentAction.value = null
    resetForm()
  }

  const resetForm = () => {
    loanApprovalForm.value = {
      check: null,
      check_date: null,
      check_by: null,
      nota: ""
    }
  }

  const confirmAction = async (
    approveFn?: (updateForm: CheckInfo, id: string) => Promise<void>,
    rejectFn?: (updateForm: CheckInfo, id: string) => Promise<void>
  ) => {
    try {
      if (isApprovalAction.value && approveFn) {
        await approveFn(loanApprovalForm.value, selectedRequestId.value as string)
      } else if (isRejectionAction.value && rejectFn) {
        await rejectFn(loanApprovalForm.value, selectedRequestId.value as string)
      }
      closeDialog()
    } catch (error) {
      console.error('Error processing action:', error)
      // Keep dialog open on error
    }
  }

  return {
    loanApprovalForm,
    isDialogOpen,
    currentAction,
    isApprovalAction,
    isRejectionAction,
    openDialog,
    openApprovalDialog,
    openRejectionDialog,
    closeDialog,
    confirmAction
  }
}