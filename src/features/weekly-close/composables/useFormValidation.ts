import { ref } from 'vue'

export function useFormValidation() {
  const isAgentPasswordCorrect = ref(false)
  const isGerentPasswordCorrect = ref(false)

  const handleAgentPasswordResult = (isCorrect: boolean) => {
    isAgentPasswordCorrect.value = isCorrect
  }

  const handleGerentPasswordResult = (isCorrect: boolean) => {
    isGerentPasswordCorrect.value = isCorrect
  }

  return {
    isAgentPasswordCorrect,
    isGerentPasswordCorrect,
    handleAgentPasswordResult,
    handleGerentPasswordResult,
  }
}