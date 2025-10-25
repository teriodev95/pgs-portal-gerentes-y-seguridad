import { useErrorHandler } from '@/shared/composables/useErrorHandler'
import { CORRECTION_ERROR_MESSAGES, type CorrectionErrorType } from '../constants/errorMessages'

export function useCorrectionErrorHandler() {
  return useErrorHandler<CorrectionErrorType>(
    CORRECTION_ERROR_MESSAGES,
    'Correction'
  )
}