import { ref, type Ref } from 'vue';
import { VALIDATION_MESSAGES } from '../constants';

interface FormData {
  newAmount?: number;
  newBonusesPaidInWeek?: number;
  newCollectionCommissionPaidInWeek?: number;
  newSalesCommissionPaidInWeek?: number;
}

interface ValidationState {
  errorMessage: string | null;
}

export function useCorrectionValidation() {
  const validationState = ref<ValidationState>({
    errorMessage: null
  });

  const clearError = () => {
    validationState.value.errorMessage = null;
  };

  const validateAmount = (amount: number): boolean => {
    if (amount < 0) {
      validationState.value.errorMessage = VALIDATION_MESSAGES.INVALID_AMOUNT;
      return false;
    }
    return true;
  };

  const validateClosureFields = (formData: FormData): boolean => {
    const validationRules = [
      { 
        value: formData.newBonusesPaidInWeek || 0, 
        message: VALIDATION_MESSAGES.INVALID_BONUS 
      },
      { 
        value: formData.newCollectionCommissionPaidInWeek || 0, 
        message: VALIDATION_MESSAGES.INVALID_COLLECTION_COMMISSION 
      },
      { 
        value: formData.newSalesCommissionPaidInWeek || 0, 
        message: VALIDATION_MESSAGES.INVALID_SALES_COMMISSION 
      }
    ];

    for (const rule of validationRules) {
      if (rule.value < 0) {
        validationState.value.errorMessage = rule.message;
        return false;
      }
    }
    return true;
  };

  const validateForm = (
    actionType: string, 
    correctionType: string, 
    formData: FormData
  ): boolean => {
    clearError();

    if (actionType === 'delete') return true;

    if (correctionType === 'cierre') {
      return validateClosureFields(formData);
    } else {
      return validateAmount(formData.newAmount || 0);
    }
  };

  return {
    validationState,
    clearError,
    validateAmount,
    validateClosureFields,
    validateForm
  };
}
