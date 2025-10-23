import { ref } from 'vue'
import { useWeeklyCloseErrorHandler } from './useWeeklyCloseErrorHandler'

export function useSubmissionFlow(
  saveWeeklyClose: () => Promise<boolean>,
  emit: (event: 'action:completed') => void
) {
  const cargando = ref(false)
  const isSendingData = ref(false)
  const showAnimation = ref(false)
  const verifyWeeklyClosing = ref(false)
  const vueSlideUnlockRef = ref()

  const { handleError, handleSubmissionError } = useWeeklyCloseErrorHandler()

  const handleCompletion = async () => {
    if (!verifyWeeklyClosing.value) {
      vueSlideUnlockRef.value.reset()
      showAnimation.value = true
      setTimeout(() => { showAnimation.value = false }, 1000)
      handleError(new Error('Confirmation required'), 'CONFIRMATION_REQUIRED')
      return
    }

    await onSubmit()
    vueSlideUnlockRef.value.reset()
  }

  const onSubmit = async () => {
    try {
      cargando.value = true
      isSendingData.value = true

      const success = await saveWeeklyClose()

      if (success) {
        emit('action:completed')
      }
    } catch (error) {
      handleSubmissionError(error)
    } finally {
      cargando.value = false
      isSendingData.value = false
    }
  }

  return {
    cargando,
    isSendingData,
    showAnimation,
    verifyWeeklyClosing,
    vueSlideUnlockRef,
    handleCompletion,
    onSubmit
  }
}