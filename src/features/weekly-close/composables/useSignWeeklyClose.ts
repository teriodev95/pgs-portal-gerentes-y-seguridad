import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSignStore, useCierreSemanalStore } from '../stores'
import { useStore } from '@/shared/stores'
import { securityPinService } from '@/features/security-pin/services/security.service'
import { STEPS } from '../constants'
import { WEEKLY_CLOSE_ERROR_MESSAGES } from '../constants/errorMessages'
import { ROUTE_NAME } from '@/router'
import { useNotification } from '@/shared/composables/useNotification'

/**
 * Types for sign flow
 */
type SignFlowState =
  | 'idle'
  | 'validating-pin'
  | 'submitting'
  | 'completed'
  | 'error'

type UserType = 'agente' | 'gerente' | 'seguridad'

/**
 * Composable to orchestrate the complete weekly close signing process
 *
 * RESPONSIBILITIES:
 * - Orchestrate the complete signing process
 * - PIN validation (agent, manager, security)
 * - Submission flow after signing
 * - Verification messages and feedback
 * - Navigation between steps
 * - Handle states: idle → validating → submitting → done/error
 *
 * NOTE: Uses useCameraRecording externally for camera operations
 */
export const useSignWeeklyClose = () => {
  const router = useRouter()
  const signStore = useSignStore()
  const globalStore = useStore()
  const weeklyCloseStore = useCierreSemanalStore()
  const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT
  const { showError, showSuccess, showWarning } = useNotification()

  // ============================================================================
  // STATE - General Flow
  // ============================================================================
  const currentState = ref<SignFlowState>('idle')
  const currentStep = ref<STEPS>(STEPS.HOME)
  const error = ref<string | null>(null)

  // ============================================================================
  // STATE - PIN Validation
  // ============================================================================
  const agentPin = ref('')
  const managerPin = ref('')
  const securityPin = ref('')
  const isAgentPinValid = ref(false)
  const isManagerPinValid = ref(false)

  // ============================================================================
  // STATE - Confirmation and Submission
  // ============================================================================
  const isSubmitting = ref(false)
  const isWeeklyCloseConfirmed = ref(false)
  const showConfirmationAnimation = ref(false)

  // ============================================================================
  // COMPUTED - Flow State
  // ============================================================================
  const isIdle = computed(() => currentState.value === 'idle')
  const isValidatingPin = computed(() => currentState.value === 'validating-pin')
  const isSubmittingData = computed(() => currentState.value === 'submitting')
  const isCompleted = computed(() => currentState.value === 'completed')
  const hasError = computed(() => currentState.value === 'error')

  // Verification completion from store
  const isAgentVerificationCompleted = computed(() => signStore.isAgentVerificationCompleted)
  const isManagerVerificationCompleted = computed(() => signStore.isManagerVerificationCompleted)
  const isAgencyVacant = computed(() => weeklyCloseStore.isAgencyVacant)
  const canCloseWithoutSigning = computed(() => signStore.canCloseWithoutSigning)

  const canSubmit = computed(() => {
    // If agency is vacant, can submit directly
    if (isAgencyVacant.value) return true

    // If user is authorized to close without signing
    if (canCloseWithoutSigning.value) return true

    // Otherwise, requires both verifications
    return isAgentVerificationCompleted.value && isManagerVerificationCompleted.value
  })

  // ============================================================================
  // METHODS - PIN Validation
  // ============================================================================

  /**
   * Validates agent PIN
   */
  const validateAgentPin = (enteredPin: string, correctPin: string): boolean => {
    const isValid = enteredPin === correctPin
    isAgentPinValid.value = isValid

    if (!isValid) {
      error.value = 'PIN de agente incorrecto'
      showError('PIN de agente incorrecto')
    } else {
      error.value = null
      showSuccess('PIN validado correctamente')
    }

    return isValid
  }

  /**
   * Validates manager PIN
   */
  const validateManagerPin = (enteredPin: string, correctPin: string): boolean => {
    const isValid = enteredPin === correctPin
    isManagerPinValid.value = isValid

    if (!isValid) {
      error.value = 'PIN de gerente incorrecto'
      showError('PIN de gerente incorrecto')
    } else {
      error.value = null
      showSuccess('PIN validado correctamente')
    }

    return isValid
  }

  /**
   * Validates security PIN (temporary PIN)
   */
  const validateSecurityPin = async (enteredPin: string): Promise<boolean> => {
    try {
      currentState.value = 'validating-pin'

      const { data: currentPin } = await securityPinService.checkPinExists(
        globalStore.gerenciaSelected as string
      )

      const firstPin = Object.values(currentPin.pins)[0] || { pin: '' }

      if (!firstPin.pin || enteredPin !== firstPin.pin) {
        throw new Error(WEEKLY_CLOSE_ERROR_MESSAGES.INVALID_OR_EXPIRED_PIN)
      }

      // If PIN is valid, mark agent verification as completed
      signStore.isAgentVerificationCompleted = true
      showSuccess('PIN de seguridad verificado correctamente')

      currentState.value = 'idle'
      return true
    } catch (error) {
      currentState.value = 'error'
      const errorMessage =
        error instanceof Error ? error.message : 'Error al validar PIN de seguridad'

      showError(errorMessage)
      return false
    }
  }

  // ============================================================================
  // METHODS - Navigation Between Steps
  // ============================================================================

  const goToStep = (step: STEPS) => {
    currentStep.value = step
  }

  const goHome = () => goToStep(STEPS.HOME)
  const goToAgentStep = () => goToStep(STEPS.AGENT_PIN_CAMERA)
  const goToManagerStep = () => goToStep(STEPS.GERENT_PIN_CAMERA)

  // ============================================================================
  // METHODS - Complete Verification Flow
  // ============================================================================

  /**
   * Completes verification for a user
   */
  const completeVerification = (userType: UserType) => {
    if (userType === 'agente') {
      signStore.isAgentVerificationCompleted = true
    } else if (userType === 'gerente') {
      signStore.isManagerVerificationCompleted = true
    }

    goHome()
  }

  /**
   * Handles final confirmation before submitting
   */
  const setWeeklyCloseConfirmation = (confirmed: boolean) => {
    isWeeklyCloseConfirmed.value = confirmed
  }

  /**
   * Handles final submission of the weekly close
   */
  const handleSubmit = async (
    saveWeeklyCloseFn: () => Promise<boolean>
  ): Promise<boolean> => {
    if (!isWeeklyCloseConfirmed.value) {
      showConfirmationAnimation.value = true
      setTimeout(() => {
        showConfirmationAnimation.value = false
      }, 1000)
      showWarning('Debes confirmar el cierre antes de continuar')
      return false
    }

    try {
      currentState.value = 'submitting'
      isSubmitting.value = true
      error.value = null

      const success = await saveWeeklyCloseFn()

      if (success) {
        currentState.value = 'completed'
        return true
      } else {
        currentState.value = 'error'
        return false
      }
    } catch (err) {
      currentState.value = 'error'
      error.value = err instanceof Error ? err.message : 'Error desconocido al enviar'
      showError('Error al completar el cierre semanal')
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Navigates back to the main weekly close view
   */
  const navigateBackToWeeklyClose = () => {
    router.push({ name: ROUTE_NAME.WEEKLY_CLOSE })
  }

  /**
   * Resets all signing flow state
   */
  const resetSignFlow = () => {
    currentState.value = 'idle'
    currentStep.value = STEPS.HOME
    error.value = null

    agentPin.value = ''
    managerPin.value = ''
    securityPin.value = ''
    isAgentPinValid.value = false
    isManagerPinValid.value = false

    isSubmitting.value = false
    isWeeklyCloseConfirmed.value = false
    showConfirmationAnimation.value = false

    signStore.reset()
  }

  // ============================================================================
  // RETURN - Public API
  // ============================================================================
  return {
    // Flow state
    currentState,
    currentStep,
    error,
    isIdle,
    isValidatingPin,
    isSubmittingData,
    isCompleted,
    hasError,

    // Verification state
    isAgentVerificationCompleted,
    isManagerVerificationCompleted,
    canCloseWithoutSigning,
    canSubmit,

    // PIN validation
    agentPin,
    managerPin,
    securityPin,
    isAgentPinValid,
    isManagerPinValid,
    validateAgentPin,
    validateManagerPin,
    validateSecurityPin,

    // Navigation between steps
    goToStep,
    goHome,
    goToAgentStep,
    goToManagerStep,

    // Confirmation and submission
    isWeeklyCloseConfirmed,
    showConfirmationAnimation,
    isSubmitting,
    setWeeklyCloseConfirmation,
    handleSubmit,

    // Complete verification
    completeVerification,

    // Navigation
    navigateBackToWeeklyClose,

    // Reset
    resetSignFlow
  }
}
