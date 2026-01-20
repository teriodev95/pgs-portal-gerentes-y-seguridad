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
    <LabelForm
      for="new-amount"
      description="Introduce el monto correcto que reemplazará al actual"
    >
      Ingresa el nuevo monto
    </LabelForm>
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
      <LabelForm
        for="collection-commission"
        description="Introduce la nueva comisión por cobranza"
      >
        Comisión por cobranza
      </LabelForm>
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
      <LabelForm
        for="sales-commission"
        description="Introduce la nueva comisión por ventas"
      >
        Comisión por ventas
      </LabelForm>
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
      <LabelForm
        for="bonuses"
        description="Introduce el nuevo monto de bonos"
      >
        Bonos
      </LabelForm>
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
