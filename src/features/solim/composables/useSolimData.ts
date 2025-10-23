import { computed, onBeforeMount, ref } from 'vue'
import { solimService } from '../services/solim.service'
import { useSolimErrorHandler } from './useSolimErrorHandler'
import type { Solicitud, CheckInfo, UpdateCheckStatus } from '../types'
import { useStore } from '@/shared/stores'
import { useToast } from 'vue-toast-notification'

export function useSolimData() {
  // Services and Composables initialization
  const $store = useStore()
  const { handleError } = useSolimErrorHandler()
  const $toast = useToast()

  // State definitions
  const loanRequests = ref<Solicitud[]>([])
  const selectedLoanRequest = ref<Solicitud | null>(null)
  const isLoadingLoanRequests = ref(false)
  const isProcessingAction = ref(false)

  // Computed properties
  const hasLoanRequests = computed(() => loanRequests.value.length > 0)
  const loanRequestsCount = computed(() => loanRequests.value.length)

  // Methods for data fetching and manipulation
  async function fetchLoanRequests(): Promise<void> {
    try {
      isLoadingLoanRequests.value = true
      const response = await solimService.getLoanApplications({
        year: $store.currentDate.year,
        managment: $store.gerenciaSelected,
        week: $store.currentDate.week
      })
      
      if (response.data && response.data.success) {
        loanRequests.value = response.data.data.solicitudes
        console.log('Fetched loan requests:', loanRequests.value)
      }
    } catch (error) {
      handleError(error, 'LOAN_REQUESTS_LOAD_FAILED')
    } finally {
      isLoadingLoanRequests.value = false
    }
  }

  async function processLoanRequest(loanApprovalForm: CheckInfo, id: string, isApproval = true): Promise<void> {
    const errorType = isApproval ? 'LOAN_REQUEST_APPROVAL_FAILED' : 'LOAN_REQUEST_REJECTION_FAILED'

    try {
      isProcessingAction.value = true
      const role = $store.user?.tipo.toLowerCase() === 'gerente' ? 'gerente' : 'seguridad';
      
      // Set metadata
      loanApprovalForm.check_date = new Date().toISOString()
      loanApprovalForm.check_by = [
        $store.user?.nombre,
        $store.user?.apellidoPaterno,
        $store.user?.apellidoMaterno
      ].filter(Boolean).join(' ').trim()

      const updateCheckStatus: UpdateCheckStatus = {
        id,
        [role]: loanApprovalForm
      }


      const response = await solimService.updateLoanApplicationStatus(updateCheckStatus)
      console.log('Process loan request response:', response)
      $toast.success(isApproval ? 'Solicitud aprobada exitosamente.' : 'Solicitud rechazada exitosamente.', {
        duration: 5000
      })
      await fetchLoanRequests() // Refresh data
    } catch (error) {
      handleError(error, errorType)
      $toast.error('Error al procesar la solicitud.', {
        duration: 5000
      })
      throw error
    } finally {
      isProcessingAction.value = false
    }
  }

  async function approveLoanRequest(loanApprovalForm: CheckInfo, id: string): Promise<void> {
    return processLoanRequest(loanApprovalForm, id, true)
  }

  async function rejectLoanRequest(loanApprovalForm: CheckInfo, id: string): Promise<void> {
    return processLoanRequest(loanApprovalForm, id, false)
  }

  function selectLoanRequest(id: string): void {
    selectedLoanRequest.value = loanRequests.value.find(request => request.id === id) || null
  }

  function clearSelectedLoanRequest(): void {
    selectedLoanRequest.value = null
  }

  // Lifecycle hooks
  onBeforeMount(async () => {
    await fetchLoanRequests()
  })

  return {
    // State
    loanRequests,
    selectedLoanRequest,
    isLoadingLoanRequests,
    isProcessingAction,
    
    // Computed - Basic
    hasLoanRequests,
    loanRequestsCount,
    
    // Methods
    fetchLoanRequests,
    approveLoanRequest,
    rejectLoanRequest,
    selectLoanRequest,
    clearSelectedLoanRequest
  }
}