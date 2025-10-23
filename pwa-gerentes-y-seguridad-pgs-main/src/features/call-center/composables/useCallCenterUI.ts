import { ref, computed } from 'vue'
import type { ICallCenterUIState, ICallCenterReport } from '../types'

/**
 * Composable para manejar el estado de la interfaz de usuario del Call Center
 * Separa la lógica de UI del store y componentes
 */
export const useCallCenterUI = () => {
  // Estado de UI
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const showRevealCircle = ref<boolean>(false)
  const creatingVisit = ref<boolean>(false)
  const isOverlayClickCloseEnabled = ref<boolean>(true)
  
  // Estado de navegación
  const activeGoToLoan = ref<boolean>(false)
  const loanID = ref<string>('')
  
  // Estado de selección
  const selectedReport = ref<ICallCenterReport | null>(null)
  const selectedClientQuestion = ref<any>(null)
  const selectedGuarantorQuestion = ref<any>(null)

  /**
   * Estado general de la UI
   */
  const uiState = computed<ICallCenterUIState>(() => ({
    isLoading: isLoading.value,
    isManagementSelected: false, // Se maneja en useCallCenterData
    isOverlayClickCloseEnabled: isOverlayClickCloseEnabled.value,
    showRevealCircle: showRevealCircle.value,
    creatingVisit: creatingVisit.value,
    error: error.value
  }))

  /**
   * Verifica si hay un error activo
   */
  const hasError = computed(() => !!error.value)

  /**
   * Verifica si la aplicación está en estado de carga
   */
  const isInLoadingState = computed(() => isLoading.value)

  /**
   * Verifica si se está creando una visita
   */
  const isCreatingVisit = computed(() => creatingVisit.value)

  /**
   * Verifica si se debe mostrar el círculo de revelación
   */
  const shouldShowRevealCircle = computed(() => showRevealCircle.value)

  /**
   * Establece el estado de carga
   */
  const setLoading = (loading: boolean) => {
    console.log('🔄 setLoading:', loading)
    isLoading.value = loading
  }

  /**
   * Establece el error
   */
  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  /**
   * Limpia el error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Muestra el círculo de revelación
   */
  const showRevealCircleNotification = () => {
    showRevealCircle.value = true
  }

  /**
   * Oculta el círculo de revelación
   */
  const hideRevealCircleNotification = () => {
    showRevealCircle.value = false
  }

  /**
   * Cierra el círculo de revelación y reinicia las selecciones
   */
  const closeRevealCircleAndReset = () => {
    hideRevealCircleNotification()
    setTimeout(() => {
      resetQuestionSelections()
    }, 1000)
  }

  /**
   * Inicia la creación de una visita
   */
  const startCreatingVisit = () => {
    creatingVisit.value = true
    isOverlayClickCloseEnabled.value = false
  }

  /**
   * Cancela la creación de una visita
   */
  const cancelVisitCreation = () => {
    creatingVisit.value = false
    isOverlayClickCloseEnabled.value = true
  }

  /**
   * Finaliza la creación de una visita
   */
  const finishVisitCreation = () => {
    creatingVisit.value = false
    isOverlayClickCloseEnabled.value = true
  }

  /**
   * Habilita/deshabilita el cierre del overlay al hacer clic
   */
  const setOverlayClickClose = (enabled: boolean) => {
    isOverlayClickCloseEnabled.value = enabled
  }

  /**
   * Selecciona un reporte
   */
  const selectReport = (report: ICallCenterReport) => {
    selectedReport.value = report
  }

  /**
   * Limpia la selección de reporte
   */
  const clearSelectedReport = () => {
    selectedReport.value = null
  }

  /**
   * Selecciona una pregunta del cliente
   */
  const selectClientQuestion = (question: any) => {
    selectedClientQuestion.value = question
  }

  /**
   * Selecciona una pregunta del aval
   */
  const selectGuarantorQuestion = (question: any) => {
    selectedGuarantorQuestion.value = question
  }

  /**
   * Reinicia las selecciones de preguntas
   */
  const resetQuestionSelections = () => {
    selectedClientQuestion.value = null
    selectedGuarantorQuestion.value = null
    selectedReport.value = null
  }

  /**
   * Activa la navegación hacia un préstamo
   */
  const activateGoToLoan = (loanId: string) => {
    activeGoToLoan.value = true
    loanID.value = loanId
  }

  /**
   * Desactiva la navegación hacia un préstamo
   */
  const deactivateGoToLoan = () => {
    activeGoToLoan.value = false
    loanID.value = ''
  }

  /**
   * Limpia todos los valores relacionados con préstamos
   */
  const clearLoanValues = () => {
    deactivateGoToLoan()
  }

  /**
   * Maneja la navegación hacia atrás
   */
  const handleBackNavigation = (isManagementSelected: boolean, router: any) => {
    if (isManagementSelected) {
      // La lógica de regresar a la lista de gerencias se maneja en useCallCenterData
      return false // Indica que se debe regresar a la lista de gerencias
    } else {
      router.back()
      return true // Indica que se navegó hacia atrás
    }
  }

  /**
   * Reinicia todo el estado de UI
   */
  const resetUIState = () => {
    setLoading(false)
    clearError()
    hideRevealCircleNotification()
    cancelVisitCreation()
    clearSelectedReport()
    resetQuestionSelections()
    clearLoanValues()
  }

  return {
    // Estado computado
    uiState,
    hasError,
    isInLoadingState,
    isCreatingVisit,
    shouldShowRevealCircle,
    
    // Estado reactivo
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    showRevealCircle: computed(() => showRevealCircle.value),
    creatingVisit: computed(() => creatingVisit.value),
    isOverlayClickCloseEnabled: computed(() => isOverlayClickCloseEnabled.value),
    selectedReport: computed(() => selectedReport.value),
    activeGoToLoan: computed(() => activeGoToLoan.value),
    loanID: computed(() => loanID.value),
    
    // Métodos de estado
    setLoading,
    setError,
    clearError,
    showRevealCircleNotification,
    hideRevealCircleNotification,
    closeRevealCircleAndReset,
    
    // Métodos de visita
    startCreatingVisit,
    cancelVisitCreation,
    finishVisitCreation,
    setOverlayClickClose,
    
    // Métodos de selección
    selectReport,
    clearSelectedReport,
    selectClientQuestion,
    selectGuarantorQuestion,
    resetQuestionSelections,
    
    // Métodos de navegación
    activateGoToLoan,
    deactivateGoToLoan,
    clearLoanValues,
    handleBackNavigation,
    
    // Métodos de utilidad
    resetUIState
  }
} 