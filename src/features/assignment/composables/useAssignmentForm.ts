// composables/useAssignmentForm.ts
import { computed, ref } from 'vue';
import { useStore } from '@/shared/stores';
import { assignmentService } from '../services/assignment.service';
import type { ICreateAssignment, IUserVerificationPin } from '@/features/assignment/types';
import { ASSIGNMENT_ERROR_MESSAGES } from '../constants';
import { useNotification } from '@/shared/composables/useNotification';

type ValidationStatus = 'default' | 'success' | 'error';

export function useAssignmentForm() {
  // Services
  const $store = useStore();
  const { showError } = useNotification();

  // State - Users
  const senderUser = ref<IUserVerificationPin>();
  const recipientUser = ref<IUserVerificationPin>();

  // State - Validation
  const senderStatus = ref<ValidationStatus>('default');
  const recipientStatus = ref<ValidationStatus>('default');
  const senderErrorMessage = ref('');
  const recipientErrorMessage = ref('');
  const isVerifyingSenderPin = ref(false);
  const isVerifyingRecipientPin = ref(false);

  // State - Form
  const amount = ref(0);
  const selectedManagementSender = ref('');
  const selectedManagementRecipient = ref('');
  const inputSenderPin = ref('');
  const inputRecipientPin = ref('');
  const isCreatingAssignment = ref(false);

  // Refs para componentes
  const vueSlideUnlockRef = ref();

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
    const basicValidation = senderStatus.value !== 'success' ||
      recipientStatus.value !== 'success' ||
      amount.value <= 0;

    const senderManagementValidation = hasSenderMultipleManagements.value &&
      !selectedManagementSender.value;

    const recipientManagementValidation = hasRecipientMultipleManagements.value &&
      !selectedManagementRecipient.value;

    return basicValidation || senderManagementValidation || recipientManagementValidation;
  });

  // PIN Validation Methods
  const validateSenderPin = async () => {
    if (!inputSenderPin.value.trim()) {
      senderStatus.value = 'error';
      senderErrorMessage.value = ASSIGNMENT_ERROR_MESSAGES.PIN_REQUIRED;
      return;
    }

    try {
      isVerifyingSenderPin.value = true;
      const response = await assignmentService.verificationByPin(inputSenderPin.value);

      if (response.status !== 200) {
        senderStatus.value = 'error';
        senderErrorMessage.value = ASSIGNMENT_ERROR_MESSAGES.PIN_INCORRECT;
        return;
      }

      senderUser.value = response.data;
      senderStatus.value = 'success';
      senderErrorMessage.value = '';
    } catch (error) {
      senderStatus.value = 'error';
      senderErrorMessage.value = 'Error al validar PIN';
      showError('Error al validar PIN del remitente');
    } finally {
      isVerifyingSenderPin.value = false;
    }
  };

  const validateRecipientPin = async () => {
    if (!inputRecipientPin.value.trim()) {
      recipientStatus.value = 'error';
      recipientErrorMessage.value = ASSIGNMENT_ERROR_MESSAGES.PIN_REQUIRED;
      return;
    }

    try {
      isVerifyingRecipientPin.value = true;
      const response = await assignmentService.verificationByPin(inputRecipientPin.value);

      if (response.status !== 200) {
        recipientStatus.value = 'error';
        recipientErrorMessage.value = ASSIGNMENT_ERROR_MESSAGES.PIN_INCORRECT;
        return;
      }

      recipientUser.value = response.data;

      // Validar que no sea un agente
      if (recipientUser.value.tipo === 'Agente') {
        recipientStatus.value = 'error';
        recipientErrorMessage.value = ASSIGNMENT_ERROR_MESSAGES.AGENT_CANNOT_RECEIVE;
        return;
      }

      recipientStatus.value = 'success';
      recipientErrorMessage.value = '';
    } catch (error) {
      recipientStatus.value = 'error';
      recipientErrorMessage.value = 'Error al validar PIN';
      showError('Error al validar PIN del destinatario');
    } finally {
      isVerifyingRecipientPin.value = false;
    }
  };

  const resetSenderValidation = () => {
    senderStatus.value = 'default';
    senderErrorMessage.value = '';
    senderUser.value = undefined;
    inputSenderPin.value = '';
  };

  const resetRecipientValidation = () => {
    recipientStatus.value = 'default';
    recipientErrorMessage.value = '';
    recipientUser.value = undefined;
    inputRecipientPin.value = '';
  };

  const resetValues = () => {
    amount.value = 0;
    isCreatingAssignment.value = false;
    selectedManagementRecipient.value = '';
    selectedManagementSender.value = '';
    resetSenderValidation();
    resetRecipientValidation();
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
    } catch (error) {
      console.error('Error creating assignment:', error);
      showError('Error al crear la asignación');
    } finally {
      isCreatingAssignment.value = false;
    }
  };

  return {
    // State - Users
    senderUser,
    recipientUser,

    // State - Validation
    senderStatus,
    recipientStatus,
    senderErrorMessage,
    recipientErrorMessage,
    isVerifyingSenderPin,
    isVerifyingRecipientPin,

    // State - Form
    amount,
    selectedManagementSender,
    selectedManagementRecipient,
    inputSenderPin,
    inputRecipientPin,
    isCreatingAssignment,

    // Refs
    vueSlideUnlockRef,

    // Computed
    hasSenderMultipleManagements,
    hasRecipientMultipleManagements,
    senderSelectorText,
    recipientSelectorText,
    isSlideUnlockDisabled,

    // Methods - Validation
    validateSenderPin,
    validateRecipientPin,
    resetSenderValidation,
    resetRecipientValidation,

    // Methods - Form
    resetValues,
    handleCompletion,
  };
}