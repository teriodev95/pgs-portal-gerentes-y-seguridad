import { computed, ref } from 'vue'
import type { ApprovalDecision, ApprovalDialogForm, RevisionApproval } from '../types'

interface OpenDialogOptions {
  requestId: string
  currentApproval?: RevisionApproval | null
  currentPlanId?: number | null
  defaultDecision?: ApprovalDecision
}

const createDefaultForm = (): ApprovalDialogForm => ({
  decision: 'aprobado',
  comentario: '',
  pin: '',
  tablaCargosIdSugerido: '',
  montoAutorizado: '',
  incrementoAutorizado: '',
  nivelAutorizado: '',
  plazoAutorizado: ''
})

export function useApprovalDialog() {
  const selectedRequestId = ref<string>()
  const loanApprovalForm = ref<ApprovalDialogForm>(createDefaultForm())
  const isDialogOpen = ref(false)

  const isAdjustmentDecision = computed(
    () => loanApprovalForm.value.decision === 'aprobado_con_ajuste'
  )

  const resetForm = () => {
    loanApprovalForm.value = createDefaultForm()
  }

  const openDialog = ({
    requestId,
    currentApproval,
    currentPlanId,
    defaultDecision = 'aprobado'
  }: OpenDialogOptions) => {
    selectedRequestId.value = requestId
    loanApprovalForm.value = {
      decision:
        currentApproval?.decision && currentApproval.decision !== 'pendiente' && currentApproval.decision !== 'no_aplica'
          ? currentApproval.decision
          : defaultDecision,
      comentario: currentApproval?.comentario ?? '',
      pin: '',
      tablaCargosIdSugerido: String(
        currentApproval?.tabla_cargos_id_sugerido ?? currentPlanId ?? ''
      ),
      montoAutorizado: currentApproval?.monto_autorizado != null ? String(currentApproval.monto_autorizado) : '',
      incrementoAutorizado:
        currentApproval?.incremento_autorizado != null
          ? String(currentApproval.incremento_autorizado)
          : '',
      nivelAutorizado: currentApproval?.nivel_autorizado ?? '',
      plazoAutorizado: currentApproval?.plazo_autorizado != null ? String(currentApproval.plazo_autorizado) : ''
    }
    isDialogOpen.value = true
  }

  const closeDialog = () => {
    isDialogOpen.value = false
    selectedRequestId.value = undefined
    resetForm()
  }

  return {
    loanApprovalForm,
    isDialogOpen,
    isAdjustmentDecision,
    selectedRequestId,
    openDialog,
    closeDialog
  }
}
