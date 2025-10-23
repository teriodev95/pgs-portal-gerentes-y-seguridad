// composables/useAuthPinForm.ts
import { computed, ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/shared/stores';
import { useToast } from 'vue-toast-notification';
import { ROUTE_NAME } from '@/router';
import { authService } from '../services/auth.service';
import type { IAuthLogin } from '@/features/auth/types/auth.types';
import { useAuthErrorHandler } from './useAuthErrorHandler';
import { AUTH_CONSTANTS } from '../constants';

export function useAuthPinForm() {
  // Services
  const $router = useRouter();
  const $store = useStore();
  const $toast = useToast();
  const { handleAuthError } = useAuthErrorHandler();

  // Constants
  const PIN_LENGTH = AUTH_CONSTANTS.PIN_LENGTH;

  // State
  const isLoading = ref<boolean>(false);
  const pinForm = ref<IAuthLogin>({
    password: '',
    username: ''
  });

  // Computed
  const canSubmit = computed(() =>
    pinForm.value.password.length === PIN_LENGTH && !isLoading.value
  );

  const isPinComplete = computed(() => 
    pinForm.value.password.length === PIN_LENGTH
  );

  const handleSuccessfulAuth = (): void => {
    $store.isAuth = true;
    $store.authPin = pinForm.value.password;
    $store.saveData();
    $toast.success(AUTH_CONSTANTS.SUCCESS_MESSAGES.LOGIN_SUCCESS);
    void $router.push({ name: ROUTE_NAME.DASHBOARD_HOME });
  };

  const handlePinSubmit = async (): Promise<void> => {
    if (!canSubmit.value) return;

    isLoading.value = true;

    try {
      const response = await authService.authLogin(pinForm.value);
      $store.user = response.data;
      handleSuccessfulAuth();
    } catch (error) {
      handleAuthError(error);
    } finally {
      pinForm.value.password = '';
      isLoading.value = false;
    }
  };

  const initializeUsername = (): void => {
    if ($store.user) {
      pinForm.value.username = $store.user.usuario;
    }
  };

  const resetPin = (): void => {
    pinForm.value.password = '';
  };

  // Lifecycle
  onBeforeMount(() => {
    initializeUsername();
  });

  return {
    // Constants
    PIN_LENGTH,
    
    // State
    isLoading,
    pinForm,
    
    // Computed
    canSubmit,
    isPinComplete,
    
    // Methods
    handlePinSubmit,
    resetPin,
  };
}