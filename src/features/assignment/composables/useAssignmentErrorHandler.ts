import { useErrorHandler } from '@/shared/composables/useErrorHandler'
import { ASSIGNMENT_ERROR_MESSAGES, type AssignmentErrorType } from '../constants/errorMessages'

export function useAssignmentErrorHandler() {
  return useErrorHandler<AssignmentErrorType>(
    ASSIGNMENT_ERROR_MESSAGES,
    'Assignment'
  )
}