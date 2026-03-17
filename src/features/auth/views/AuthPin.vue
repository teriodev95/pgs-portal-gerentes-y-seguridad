<script setup lang="ts">
import { useAuthPinForm, useAuthLogout } from '../composables';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

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
  isLogoutDrawerOpen,
  openLogoutDrawer,
  closeLogoutDrawer,
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
        @click="openLogoutDrawer"
        class="p-2 text-gray-400 hover:text-white transition-colors"
        type="button"
      >
        <ArrowLeftToBracket class="h-6 w-6" />
      </button>
    </div>
  </div>

  <!-- Logout Confirmation Drawer -->
  <Drawer :open="isLogoutDrawerOpen" @update:open="(value: boolean) => value ? null : closeLogoutDrawer()">
    <DrawerContent>
      <div class="mx-auto w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>¿Estás seguro de que quieres cerrar sesión?</DrawerTitle>
          <DrawerDescription>
            Esta acción cerrará tu sesión actual
          </DrawerDescription>
        </DrawerHeader>

        <div class="p-4 pb-6">
          <div class="flex gap-4">
            <BtnComponent variant="secondary" full-width @click="handleLogout">
              Sí, cerrar sesión
            </BtnComponent>

            <BtnComponent variant="secondary" outline full-width @click="closeLogoutDrawer">
              No, mantener sesión
            </BtnComponent>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>