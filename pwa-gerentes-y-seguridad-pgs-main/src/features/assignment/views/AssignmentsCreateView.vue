<script setup lang="ts">
import { ROUTE_NAME } from '@/router';
import { useAssignmentForm } from '../composables';
import { useAssignmentStyles } from '../composables';

// Componentes
import SlideUnlock from 'vue-slide-unlock';
import ValidationPin from '@/features/assignment/components/ValidationPin.vue';
import OptionSelector from '@/features/assignment/components/OptionSelector.vue';
import CardContainer from '@/shared/components/CardContainer.vue';
import SectionContainer from '@/shared/components/SectionContainer.vue';
import NavbarTop from '@/shared/components/NavbarTop.vue';

// Composables
const {
  // State
  senderUser,
  recipientUser,
  amount,
  selectedManagementSender,
  selectedManagementRecipient,
  inputSenderPin,
  inputRecipientPin,

  // Refs
  vueSlideUnlockRef,
  SenderValidationPin,
  RecipientValidationPin,

  // Computed
  senderSelectorText,
  recipientSelectorText,
  isSlideUnlockDisabled,

  // Methods
  handleRecipientPasswordResult,
  handleSenderPasswordResult,
  handleCompletion,
} = useAssignmentForm();

const { slideUnlockStyles } = useAssignmentStyles();
</script>

<template>
  <main class="min-h-screen bg-slate-100 pb-[6rem]">
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Crear asignación" :back="{ name: ROUTE_NAME.MANAGER_ASSIGNMENTS_VIEW }" />
    </div>

    <SectionContainer>
      <CardContainer>
        <h1 class="title">Crea una asiganción</h1>
        <h2 class="subtitle">
          Ingresa la información correspondiente para el tipo de asiganción que estás registrando
        </h2>
      </CardContainer>

      <CardContainer>
        <h1 class="title">Datos</h1>

        <!-- Entrada de monto -->
        <div class="flex justify-center items-center gap-2">
          <span class="text-3xl text-blue-700">$</span>
          <input type="number" v-model="amount" min="0"
            class="w-[60%] border-l-0 border-r-0 border-t-0 border-gray-400 bg-none p-2 text-center text-4xl text-blue-700 outline-none focus:outline-none" />
        </div>

        <!-- Sección de quien entrega -->
        <ValidationPin label="PIN QUIEN" v-model:pin="inputSenderPin" type="sender"
          @password-validation="handleSenderPasswordResult" @user="(user) => senderUser = user"
          ref="SenderValidationPin" />

        <!-- Selector de gerencia para remitente (si aplica) -->
        <OptionSelector v-if="senderUser && senderUser.gerenciasACargo.length" type="sender"
          :options="senderUser!.gerenciasACargo.map(gerencia => gerencia.gerenciaid)" :text="senderSelectorText"
          v-model:model-value="selectedManagementSender" />

        <!-- Sección de quien recibe -->
        <ValidationPin label="PIN QUIEN" v-model:pin="inputRecipientPin" type="recipient"
          @password-validation="handleRecipientPasswordResult" @user="(user) => recipientUser = user"
          ref="RecipientValidationPin" />

        <!-- Selector de gerencia para destinatario (si aplica) -->
        <OptionSelector v-if="recipientUser && recipientUser.gerenciasACargo.length" type="recipient"
          :options="recipientUser!.gerenciasACargo.map(gerencia => gerencia.gerenciaid)" :text="recipientSelectorText"
          v-model:model-value="selectedManagementRecipient" />

        <!-- Control de desbloqueo deslizante -->
        <div class="space-y-2 p-5">
          <slide-unlock ref="vueSlideUnlockRef" :auto-width="true" :circle="true" :disabled="isSlideUnlockDisabled"
            :noanimate="false" text="Guardar" success-text="Completado" name="slideunlock" :style="slideUnlockStyles"
            @completed="handleCompletion" />
        </div>
      </CardContainer>
    </SectionContainer>
  </main>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  outline: none;
}
</style>