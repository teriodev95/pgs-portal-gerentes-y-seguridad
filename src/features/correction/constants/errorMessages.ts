import { BASE_ERROR_MESSAGES } from '@/shared/constants/base-error-messages'

export const CORRECTION_ERROR_MESSAGES = {
  CORRECTION_SUBMIT_FAILED: 'Error al enviar la solicitud de corrección',
  ...BASE_ERROR_MESSAGES
} as const

export type CorrectionErrorType = keyof typeof CORRECTION_ERROR_MESSAGES