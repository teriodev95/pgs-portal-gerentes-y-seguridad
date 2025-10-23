import { useSolimData } from './useSolimData'
import { useLoanRequestDetails } from './useLoanRequestDetails'

export function useSolim() {
  // Main data management composable
  const {
    loanRequests,
    selectedLoanRequest,
    isLoadingLoanRequests,
    isProcessingAction,
    hasLoanRequests,
    loanRequestsCount,
    fetchLoanRequests,
    approveLoanRequest,
    rejectLoanRequest,
    selectLoanRequest,
    clearSelectedLoanRequest
  } = useSolimData()

  // Detail sections composable
  const {
    addressInfo,
    analysisCreditInfo,
    checksInfo,
    clientDocuments,
    clientInfo,
    creditInfo,
    guarantorDocuments,
    guarantorInfo,
    scheduleInfo,
  } = useLoanRequestDetails(selectedLoanRequest)

  return {
    // State
    loanRequests,
    selectedLoanRequest,
    isLoadingLoanRequests,
    isProcessingAction,
    
    // Computed - Basic
    hasLoanRequests,
    loanRequestsCount,
    
    // Computed - Detail sections
    addressInfo,
    analysisCreditInfo,
    checksInfo,
    clientDocuments,
    clientInfo,
    creditInfo,
    guarantorDocuments,
    guarantorInfo,
    scheduleInfo,
    
    // Methods
    fetchLoanRequests,
    approveLoanRequest,
    rejectLoanRequest,
    selectLoanRequest,
    clearSelectedLoanRequest
  }
}