<script setup lang="ts">
import { useRouter } from 'vue-router'

// Shared Components
import CardContainer from '@/shared/components/CardContainer.vue';
import NavbarCT from '@/shared/components/ui/NavbarCT.vue';
import MainCT from '@/shared/components/ui/MainCT.vue';
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

const router = useRouter();

// Use the composable and store
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

// Methods
function handleBack() {
  router.back();
}
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Solicitud de corrección"
      :show-back-button="true"
      @back="handleBack"
    />

    <SectionContainer>
      <CardContainer :title="formTitle">
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
  </MainCT>
</template>