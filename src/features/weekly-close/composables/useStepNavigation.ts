import { ref } from 'vue'
import { STEPS } from '../constants/stepConstants'

export function useStepNavigation() {
  const currentStep = ref(STEPS.HOME)

  const goToStep = (nextStep: STEPS) => {
    currentStep.value = nextStep
  }

  const goHome = () => goToStep(STEPS.HOME)
  const goToAgentStep = () => goToStep(STEPS.AGENT_PIN_CAMERA)
  const goToGerentStep = () => goToStep(STEPS.GERENT_PIN_CAMERA)

  return {
    currentStep,
    goToStep,
    goHome,
    goToAgentStep,
    goToGerentStep
  }
}