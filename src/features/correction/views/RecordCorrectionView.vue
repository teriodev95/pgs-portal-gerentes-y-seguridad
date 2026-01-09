<script setup lang="ts">
import { useRevealCircleStore } from '@/shared/stores/revealCircle';

// Shared Components
import CardContainer from '@/shared/components/CardContainer.vue';
import NavbarTop from '@/shared/components/NavbarTop.vue';
import SectionContainer from '@/shared/components/SectionContainer.vue';

// Feature Components
import {
  ActionTypeSelector,
  RecordInfoDisplay,
  CorrectionFormFields,
  FormSubmitActions
} from '../components';

// Composables
import { useRecordCorrection } from '../composables';

// Define props for route parameters
interface Props {
  type: string;
  id: string;
  amount: string;
}

// Define props
defineProps<Props>();

// Use the composable and store
const revealCircleStore = useRevealCircleStore();
const {
  state,
  formData,
  currentData,
  formTitle,
  isFormValid,
  shouldShowActionSelection,
  shouldShowAmountField,
  shouldShowClosureFields,
  handleSubmit,
  handleCancel,
  updateActionType,
  errorMessage
} = useRecordCorrection();
</script>

<template>
  <main class="min-h-screen bg-slate-100">
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Solicitud de corrección" :back="true" />
    </div>

    <SectionContainer>
      <CardContainer>
        <h2 class="font-semibold title">{{ formTitle }}</h2>

        <!-- Action Type Selection -->
        <ActionTypeSelector
          :correction-type="state.correctionType"
          :selected-action="state.actionType"
          :show-selection="shouldShowActionSelection"
          @update:action="updateActionType"
        />

        <!-- Correction Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Current Values Information -->
          <RecordInfoDisplay
            :record-id="state.recordId"
            :correction-type="state.correctionType"
            :current-data="currentData"
          />

          <!-- Form Fields -->
          <CorrectionFormFields
            :form-data="formData"
            :should-show-amount-field="shouldShowAmountField"
            :should-show-closure-fields="shouldShowClosureFields"
            @update:form-data="(newData) => Object.assign(formData, newData)"
          />

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-500 text-sm">
            {{ errorMessage }}
          </div>

          <!-- Form Buttons -->
          <FormSubmitActions
            :action-type="state.actionType"
            :is-submitting="state.isSubmitting"
            :is-form-valid="isFormValid"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </form>
      </CardContainer>
    </SectionContainer>
  </main>
</template>