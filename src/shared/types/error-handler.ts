import type { BASE_ERROR_MESSAGES } from '../constants/base-error-messages'

export type BaseErrorType = keyof typeof BASE_ERROR_MESSAGES

export type FeatureErrorMessages<T extends string> = Record<T, string> & {
  NETWORK_ERROR: string
  UNKNOWN_ERROR: string
}

export interface ErrorHandlerReturn<T extends string> {
  handleError: (error: unknown, errorType: T | BaseErrorType) => void
  handleNetworkError: (error: unknown) => void
  handleValidationError: (error: unknown, message?: string) => void
  handleSuccessMessage: (message: string) => void
  isNetworkError: (error: unknown) => boolean
  messages: FeatureErrorMessages<T>
}