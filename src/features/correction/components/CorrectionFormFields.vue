<script setup lang="ts">
import InputGeneric from '@/shared/components/forms/InputGeneric.vue';
import LabelForm from '@/shared/components/forms/LabelForm.vue';

interface FormData {
  newAmount: number;
  newBonusesPaidInWeek: number;
  newCollectionCommissionPaidInWeek: number;
  newSalesCommissionPaidInWeek: number;
}

interface Props {
  formData: FormData;
  shouldShowAmountField: boolean;
  shouldShowClosureFields: boolean;
}

interface Emits {
  (event: 'update:formData', value: FormData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const updateFormData = (field: keyof FormData, value: number) => {
  emit('update:formData', {
    ...props.formData,
    [field]: value
  });
};
</script>

<template>
  <!-- Standard Correction Amount Field -->
  <div v-if="shouldShowAmountField" class="space-y-2">
    <div class="space-y-1">
      <LabelForm for="new-amount">Ingresa el nuevo monto</LabelForm>
      <LabelForm for="new-amount" size="xs">
        Introduce el monto correcto que reemplazará al actual
      </LabelForm>
    </div>
    <InputGeneric 
      id="new-amount" 
      type="number" 
      :model-value="formData.newAmount"
      @update:model-value="updateFormData('newAmount', $event as number)"
      placeholder="Ingresa un nuevo monto" 
      min="0" 
      step="0.01" 
    />
  </div>

  <!-- Closure Correction Fields -->
  <template v-if="shouldShowClosureFields">
    <div class="space-y-2">
      <div class="space-y-1">
        <LabelForm for="collection-commission">Comisión por cobranza</LabelForm>
        <LabelForm for="collection-commission" size="xs">
          Introduce la nueva comisión por cobranza
        </LabelForm>
      </div>
      <InputGeneric 
        id="collection-commission" 
        type="number"
        :model-value="formData.newCollectionCommissionPaidInWeek"
        @update:model-value="updateFormData('newCollectionCommissionPaidInWeek', $event as number)"
        placeholder="Ingresa la comisión por cobranza"
        min="0" 
        step="0.01" 
      />
    </div>

    <div class="space-y-2">
      <div class="space-y-1">
        <LabelForm for="sales-commission">Comisión por ventas</LabelForm>
        <LabelForm for="sales-commission" size="xs">
          Introduce la nueva comisión por ventas
        </LabelForm>
      </div>
      <InputGeneric 
        id="sales-commission" 
        type="number" 
        :model-value="formData.newSalesCommissionPaidInWeek"
        @update:model-value="updateFormData('newSalesCommissionPaidInWeek', $event as number)"
        placeholder="Ingresa la comisión por ventas" 
        min="0" 
        step="0.01" 
      />
    </div>

    <div class="space-y-2">
      <div class="space-y-1">
        <LabelForm for="bonuses">Bonos</LabelForm>
        <LabelForm for="bonuses" size="xs">Introduce el nuevo monto de bonos</LabelForm>
      </div>
      <InputGeneric 
        id="bonuses" 
        type="number" 
        :model-value="formData.newBonusesPaidInWeek"
        @update:model-value="updateFormData('newBonusesPaidInWeek', $event as number)"
        placeholder="Ingresa los bonos pagados" 
        min="0" 
        step="0.01" 
      />
    </div>
  </template>
</template>
