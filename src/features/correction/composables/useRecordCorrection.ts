import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import { toCurrency } from '@/shared/utils';
import type { CorrectionType } from '../types';
import { correctionService } from '../services/correction.service';
import { useStore } from '@/shared/stores';
import { useCorrectionValidation } from './useCorrectionValidation';
import { useCorrectionData } from './useCorrectionData';
import { TYPE_LABELS } from '../constants';
import { useCorrectionErrorHandler } from './useCorrectionErrorHandler';

// Types
type ActionType = 'correct' | 'delete' | '';

interface CorrectionFormData {
  newAmount: number;
  newBonusesPaidInWeek: number;
  newCollectionCommissionPaidInWeek: number;
  newSalesCommissionPaidInWeek: number;
}

// Remove constants - now imported from constants file

export function useRecordCorrection() {
  // Composables
  const route = useRoute();
  const $store = useStore();
  const { validationState, validateForm } = useCorrectionValidation();
  const { buildCorrectionData, buildCorrectionRequest, parseAmountFromUrl } = useCorrectionData();
  const { handleError } = useCorrectionErrorHandler();

  // Get params from URL
  console.log(route.params, "PARAMS")
  const correctionType = route.params.type as CorrectionType;
  const recordId = route.params.id as string;
  const amountParam = route.params.amount as string;

  const parsedAmounts = parseAmountFromUrl(amountParam, correctionType);

  // State
  const state = ref({
    actionType: '' as ActionType,
    correctionType: correctionType || 'asignacion',
    isSubmitting: false,
    recordId: recordId || '',
    showRevealCircle: false
  });

  // Current data state from URL parameters
  const currentData = ref({
    amount: parsedAmounts.amount || 0,
    bonusesPaidInWeek: parsedAmounts.bonusesPaidInWeek || 0,
    collectionCommissionPaidInWeek: parsedAmounts.collectionCommissionPaidInWeek || 0,
    salesCommissionPaidInWeek: parsedAmounts.salesCommissionPaidInWeek || 0
  });

  // Form data
  const formData = ref<CorrectionFormData>({
    newAmount: 0,
    newBonusesPaidInWeek: 0,
    newCollectionCommissionPaidInWeek: 0,
    newSalesCommissionPaidInWeek: 0
  });

  const formTitle = computed(() => {
    const typeLabel = TYPE_LABELS[state.value.correctionType] ||
      state.value.correctionType.charAt(0).toUpperCase() + state.value.correctionType.slice(1);

    const action = state.value.actionType === 'correct' ? 'corregir' : 'eliminar';
    return `Solicitud para ${action} ${typeLabel.toLowerCase()}`;
  });

  const isFormValid = computed(() => {
    if (state.value.actionType === 'delete') return true;

    if (state.value.correctionType === 'cierre') {
      return formData.value.newBonusesPaidInWeek >= 0 &&
        formData.value.newCollectionCommissionPaidInWeek >= 0 &&
        formData.value.newSalesCommissionPaidInWeek >= 0;
    }

    return formData.value.newAmount >= 0;
  });

  const shouldShowActionSelection = computed(() =>
    state.value.correctionType !== 'cierre' && state.value.correctionType !== 'venta'
  );

  const shouldShowAmountField = computed(() =>
    state.value.actionType === 'correct' && state.value.correctionType !== 'cierre'
  );

  const shouldShowClosureFields = computed(() =>
    state.value.actionType === 'correct' && state.value.correctionType === 'cierre'
  );

  // Methods
  const resetForm = () => {
    validationState.value.errorMessage = null;
    state.value.isSubmitting = false;
    state.value.actionType = 'correct';

    Object.assign(formData.value, {
      newAmount: 0,
      newBonusesPaidInWeek: 0,
      newCollectionCommissionPaidInWeek: 0,
      newSalesCommissionPaidInWeek: 0
    });
  };

  const handleSubmit = async () => {
    if (!validateForm(state.value.actionType, state.value.correctionType, formData.value)) return;

    state.value.isSubmitting = true;

    try {
      const correctionData = buildCorrectionData(
        state.value.correctionType,
        state.value.recordId,
        state.value.actionType,
        formData.value
      );
      
      const correctionRequest = buildCorrectionRequest(correctionData, {
        agencySelected: $store.agencySelected as string,
        gerenciaSelected: $store.gerenciaSelected as string,
        currentDate: $store.currentDate,
        user: $store.user as { usuario: string }
      });

      console.log('Correction Request:', correctionRequest);
      // Send the request to the API
      const response = await correctionService.correctionsCreateOne(correctionRequest);

      // Handle successful response
      state.value.showRevealCircle = true;
      return response.data;
    } catch (error: any) {
      console.error('Error submitting correction:', error);
      handleError(error, 'CORRECTION_SUBMIT_FAILED');
      throw error;
    } finally {
      state.value.isSubmitting = false;
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleCancelRevealCircle = () => {
    state.value.showRevealCircle = false;
    resetForm();
    window.history.back();
  };

  const updateActionType = (actionType: 'correct' | 'delete') => {
    state.value.actionType = actionType;
  };

  // Watchers
  watch(
    () => state.value.actionType,
    () => {
      Object.assign(formData.value, {
        newAmount: 0,
        newBonusesPaidInWeek: 0,
        newCollectionCommissionPaidInWeek: 0,
        newSalesCommissionPaidInWeek: 0
      });
    }
  );

  // Number parsing watchers - ensure values are always numbers
  watch(
    () => formData.value.newAmount,
    (val: number | string) => {
      const numValue = parseFloat(val.toString()) || 0;
      if (formData.value.newAmount !== numValue) {
        formData.value.newAmount = numValue;
      }
    }
  );

  watch(
    () => formData.value.newBonusesPaidInWeek,
    (val: number | string) => {
      const numValue = parseFloat(val.toString()) || 0;
      if (formData.value.newBonusesPaidInWeek !== numValue) {
        formData.value.newBonusesPaidInWeek = numValue;
      }
    }
  );

  watch(
    () => formData.value.newCollectionCommissionPaidInWeek,
    (val: number | string) => {
      const numValue = parseFloat(val.toString()) || 0;
      if (formData.value.newCollectionCommissionPaidInWeek !== numValue) {
        formData.value.newCollectionCommissionPaidInWeek = numValue;
      }
    }
  );

  watch(
    () => formData.value.newSalesCommissionPaidInWeek,
    (val: number | string) => {
      const numValue = parseFloat(val.toString()) || 0;
      if (formData.value.newSalesCommissionPaidInWeek !== numValue) {
        formData.value.newSalesCommissionPaidInWeek = numValue;
      }
    }
  );

  // Lifecycle hooks
  onMounted(() => {
    if (state.value.correctionType === 'venta') {
      state.value.actionType = 'delete';
    } else if (state.value.correctionType === 'cierre') {
      state.value.actionType = 'correct';
    }
  });

  onBeforeRouteLeave(() => {
    resetForm();
  });

  return {
    // State
    state,
    formData,
    currentData,
    
    // Computed
    formTitle,
    isFormValid,
    shouldShowActionSelection,
    shouldShowAmountField,
    shouldShowClosureFields,
    
    // Methods
    resetForm,
    handleSubmit,
    handleCancel,
    handleCancelRevealCircle,
    updateActionType,
    
    // Utilities
    toCurrency,
    
    // Validation
    errorMessage: computed(() => validationState.value.errorMessage)
  };
}
