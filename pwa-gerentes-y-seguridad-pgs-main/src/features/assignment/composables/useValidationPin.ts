import { computed, ref, type Ref } from 'vue'
import type { IUserVerificationPin } from '@/features/assignment/types'
import { assignmentService } from '../services/assignment.service'
import { useAssignmentErrorHandler } from './useAssignmentErrorHandler'
import { ASSIGNMENT_ERROR_MESSAGES } from '../constants'

// Types
export type ValidationStatus = 'success' | 'error' | 'default'
export type ValidationPinType = 'sender' | 'recipient'

interface ValidationConfig {
  label: string
  input: string
  message: string
  icon: string
}

type ValidationStyles = Record<ValidationStatus, ValidationConfig>

interface ValidationPinEmits {
  (e: 'update:pin', pin: string): void
  (e: 'password-validation', isCorrect: boolean, msg?: string): void
  (e: 'user', user: IUserVerificationPin): void
}

interface UseValidationPinProps {
  pin: Ref<string>
  type: ValidationPinType
  emits: ValidationPinEmits
}

export interface UseValidationPinReturn {
  // State
  status: Ref<ValidationStatus>
  user: Ref<IUserVerificationPin | undefined>
  isVerifyingPin: Ref<boolean>
  
  // Computed
  isInvalidRecipient: Ref<boolean>
  currentStyles: Ref<ValidationConfig>
  
  // Methods
  handleInput: (event: Event) => void
  validatePin: () => Promise<void>
  resetStatus: () => void
  
  // Constants
  validationStyles: ValidationStyles
}

export function useValidationPin({ pin, type, emits }: UseValidationPinProps): UseValidationPinReturn {
  // Services
  const { handleValidationError: handleAssignmentError } = useAssignmentErrorHandler()
  
  // State
  const status = ref<ValidationStatus>('default')
  const user = ref<IUserVerificationPin>()
  const isVerifyingPin = ref(false)
  
  // Constants - Validation styles configuration
  const validationStyles: ValidationStyles = {
    success: {
      label: 'text-green-700 dark:text-green-500',
      input: 'bg-green-50 border border-green-500 text-green-900 dark:text-green-400 placeholder-green-700 dark:placeholder-green-500 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-green-500',
      message: 'text-green-600 dark:text-green-500',
      icon: 'text-green-500'
    },
    error: {
      label: 'text-red-700 dark:text-red-500',
      input: 'bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500',
      message: 'text-red-600 dark:text-red-500',
      icon: 'text-red-500'
    },
    default: {
      label: '',
      input: 'bg-gray-50 border border-gray-500 text-gray-400 placeholder-gray-700 text-sm rounded-lg focus:ring-gray-500 dark:bg-gray-700 focus:border-gray-500 block w-full p-2.5 dark:text-gray-500 dark:placeholder-gray-500 dark:border-gray-500',
      message: '',
      icon: 'text-gray-500'
    }
  }
  
  // Computed
  const isInvalidRecipient = computed(() => {
    return user.value?.tipo === 'Agente' && type === 'recipient'
  })
  
  const currentStyles = computed(() => {
    return validationStyles[status.value]
  })
  
  // Methods
  const handleInput = (event: Event): void => {
    const inputElement = event.target as HTMLInputElement
    emits('update:pin', inputElement.value)
  }
  
  const resetStatus = (): void => {
    status.value = 'default'
    user.value = undefined
  }
  
  const validatePin = async (): Promise<void> => {
    if (!pin.value.trim()) {
      status.value = 'error'
      emits('password-validation', false, ASSIGNMENT_ERROR_MESSAGES.PIN_REQUIRED)
      return
    }
    
    try {
      isVerifyingPin.value = true
      const response = await assignmentService.verificationByPin(pin.value)
      
      user.value = response.data
      
      if (response.status !== 200) {
        handleValidationError(ASSIGNMENT_ERROR_MESSAGES.PIN_INCORRECT)
        return
      }
      
      if (isAgentReceivingAssignment()) {
        handleValidationError(ASSIGNMENT_ERROR_MESSAGES.AGENT_CANNOT_RECEIVE)
        return
      }
      
      handleValidationSuccess(response.data)
      
    } catch (error) {
      console.error('Error validating PIN:', error)
      handleAssignmentError(error, 'Error al validar PIN')
    } finally {
      isVerifyingPin.value = false
    }
  }
  
  // Helper methods
  const isAgentReceivingAssignment = (): boolean => {
    return user.value?.tipo === 'Agente' && type === 'recipient'
  }
  
  const handleValidationError = (message?: string): void => {
    status.value = 'error'
    emits('password-validation', false, message)
  }
  
  const handleValidationSuccess = (userData: IUserVerificationPin): void => {
    status.value = 'success'
    emits('password-validation', true)
    emits('user', userData)
  }
  
  return {
    // State
    status,
    user,
    isVerifyingPin,
    
    // Computed
    isInvalidRecipient,
    currentStyles,
    
    // Methods
    handleInput,
    validatePin,
    resetStatus,
    
    // Constants
    validationStyles
  }
}