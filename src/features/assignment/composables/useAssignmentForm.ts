// composables/useAssignmentForm.ts
import { computed, ref } from 'vue';
import { useStore } from '@/shared/stores';
import { assignmentService } from '../services/assignment.service';
import type { ICreateAssignment, IUserVerificationPin } from '@/features/assignment/types';
import { useAssignmentErrorHandler } from './useAssignmentErrorHandler';
import { VALIDATION_MESSAGES } from '../constants';

export function useAssignmentForm() {
  // Services
  const $store = useStore();
  const { handleError, handleSuccessMessage } = useAssignmentErrorHandler();

  // State
  const senderUser = ref<IUserVerificationPin>();
  const recipientUser = ref<IUserVerificationPin>();
  const isRecipientUserVerified = ref(false);
  const isSenderUserVerified = ref(false);
  const amount = ref(0);
  const selectedManagementSender = ref('');
  const selectedManagementRecipient = ref('');
  const inputSenderPin = ref('');
  const inputRecipientPin = ref('');
  const isCreatingAssignment = ref(false);

  // Refs para componentes
  const vueSlideUnlockRef = ref();
  const SenderValidationPin = ref();
  const RecipientValidationPin = ref();

  // Computed properties
  const hasSenderMultipleManagements = computed<boolean>(
    () => (senderUser.value?.gerenciasACargo?.length ?? 0) > 1
  );

  const hasRecipientMultipleManagements = computed<boolean>(
    () => (recipientUser.value?.gerenciasACargo?.length ?? 0) > 1
  );

  const senderSelectorText = computed(() => {
    if (!senderUser.value) return '';

    const hasMultiple = hasSenderMultipleManagements.value;
    const name = senderUser.value.nombre;

    return `${name} tiene ${hasMultiple ? 'más de' : ''} una gerencia asignada. ${
      hasMultiple ? 'Selecciona la gerencia con la que estás entregando la asignación.' : ''
    }`;
  });

  const recipientSelectorText = computed(() => {
    if (!recipientUser.value) return '';

    const hasMultiple = hasRecipientMultipleManagements.value;
    const name = recipientUser.value.nombre;

    return `${name} tiene ${hasMultiple ? 'más de' : ''} una gerencia asignada. ${
      hasMultiple ? 'Selecciona la gerencia con la que estás entregando la asignación.' : ''
    }`;
  });

  const isSlideUnlockDisabled = computed(() => {
    const basicValidation = !isRecipientUserVerified.value ||
      !isSenderUserVerified.value ||
      amount.value <= 0;

    const senderManagementValidation = hasSenderMultipleManagements.value &&
      !selectedManagementSender.value;

    const recipientManagementValidation = hasRecipientMultipleManagements.value &&
      !selectedManagementRecipient.value;

    return basicValidation || senderManagementValidation || recipientManagementValidation;
  });

  // Methods
  const handleRecipientPasswordResult = (isCorrect: boolean, msg?: string) => {
    if (!isCorrect && msg) {
      handleError(new Error(msg), 'PIN_VALIDATION_FAILED');
    }
    isRecipientUserVerified.value = isCorrect;
  };

  const handleSenderPasswordResult = (isCorrect: boolean) => {
    isSenderUserVerified.value = isCorrect;
  };

  const resetValues = () => {
    amount.value = 0;
    inputRecipientPin.value = '';
    inputSenderPin.value = '';
    isCreatingAssignment.value = false;
    isRecipientUserVerified.value = false;
    isSenderUserVerified.value = false;
    recipientUser.value = undefined;
    RecipientValidationPin.value?.resetStatus();
    selectedManagementRecipient.value = '';
    selectedManagementSender.value = '';
    senderUser.value = undefined;
    SenderValidationPin.value?.resetStatus();
  };

  const createAssignmentData = (): ICreateAssignment => {
    const assignmentId = window.crypto.randomUUID();

    return {
      anio: $store.currentDate.year,
      gerenciaEntrega: senderUser.value?.gerenciasACargo.length ? selectedManagementSender.value : '',
      gerenciaRecibe: recipientUser.value?.gerenciasACargo.length ? selectedManagementRecipient.value : '',
      monto: amount.value,
      quienEntrego: senderUser.value?.usuarioid || 0,
      quienRecibio: recipientUser.value?.usuarioid || 0,
      semana: $store.currentDate.week,
      log: undefined,
      id: assignmentId,
    };
  };

  const handleCompletion = async () => {
    try {
      isCreatingAssignment.value = true;

      const assignment = createAssignmentData();
      console.log('Asignación a crear:', assignment);

      await assignmentService.createAssignment(assignment);
      vueSlideUnlockRef.value.reset();
      resetValues();
      
      handleSuccessMessage(VALIDATION_MESSAGES.SUCCESS.ASSIGNMENT_CREATED);
    } catch (error) {
      handleError(error, 'ASSIGNMENT_CREATE_FAILED');
    } finally {
      isCreatingAssignment.value = false;
    }
  };

  return {
    // State
    senderUser,
    recipientUser,
    isRecipientUserVerified,
    isSenderUserVerified,
    amount,
    selectedManagementSender,
    selectedManagementRecipient,
    inputSenderPin,
    inputRecipientPin,
    isCreatingAssignment,
    
    // Refs
    vueSlideUnlockRef,
    SenderValidationPin,
    RecipientValidationPin,
    
    // Computed
    hasSenderMultipleManagements,
    hasRecipientMultipleManagements,
    senderSelectorText,
    recipientSelectorText,
    isSlideUnlockDisabled,
    
    // Methods
    handleRecipientPasswordResult,
    handleSenderPasswordResult,
    resetValues,
    handleCompletion,
  };
}