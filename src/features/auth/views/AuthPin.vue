<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css';
import { useAuthPinForm, useAuthLogout } from '../composables';
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet';

import ArrowLeftToBracket from '@/shared/components/icons/ArrowLeftToBracket.vue';
import BtnComponent from '@/shared/components/BtnComponent.vue';
import PinInput from '../components/forms/PinInput.vue';

// Services, Composables and Stores initialization
const {
  PIN_LENGTH,
  isLoading,
  pinForm,
  isPinComplete,
  handlePinSubmit,
} = useAuthPinForm();

const {
  logoutBottomSheet,
  openLogoutBottomSheet,
  closeLogoutBottomSheet,
  handleLogout,
} = useAuthLogout();

// Handle PIN completion
const onPinComplete = () => {
  if (isPinComplete.value) {
    void handlePinSubmit();
  }
};
</script>

<template>
  <div class="space-y-8">
    <!-- PIN Input Form -->
    <div class="space-y-6">
      <!-- Instruction Text -->
      <div class="flex items-center justify-center gap-4 text-sm text-gray-400">
        {{ pinForm.usuario }} inserte su PIN de usuario
      </div>

      <!-- PIN Input -->
      <PinInput
        v-model="pinForm.pin"
        :length="PIN_LENGTH"
        :loading="isLoading"
        @complete="onPinComplete"
      />
    </div>

    <!-- Logout Button -->
    <div class="flex justify-center">
      <button 
        @click="openLogoutBottomSheet" 
        class="p-2 text-gray-400 hover:text-white transition-colors"
        type="button"
      >
        <ArrowLeftToBracket class="h-6 w-6" />
      </button>
    </div>
  </div>

  <!-- Logout Confirmation Bottom Sheet -->
  <vue-bottom-sheet ref="logoutBottomSheet" :max-width="1000" :max-height="1000">
    <div class="p-4 space-y-6">
      <p class="text-xl font-semibold">¿Estás seguro de que quieres cerrar sesión?</p>

      <div class="flex gap-4">
        <BtnComponent variant="secondary" full-width @click="handleLogout">
          Sí, cerrar sesión
        </BtnComponent>

        <BtnComponent variant="secondary" outline full-width @click="closeLogoutBottomSheet">
          No, mantener sesión
        </BtnComponent>
      </div>
    </div>
  </vue-bottom-sheet>
</template>