<script setup lang="ts">
import { toCurrency } from '@/shared/utils';
import type { SaleFormData } from '../types';

// Components
import InputGeneric from '@/shared/components/forms/InputGeneric.vue';
import LabelForm from '@/shared/components/forms/LabelForm.vue';
import InputSelect from '@/shared/components/forms/InputSelect.vue';

// Composables
import { useSaleForm } from '@/features/sale/composables/useSaleForm';

interface Props {
  isDisabled: boolean;
}

defineProps<Props>();

// Emits
interface Emits {
  (event: 'action:save', sale: SaleFormData): void;
}

const $emits = defineEmits<Emits>();

// Inicializar composable
const {
  saleForm,
  availableAmounts,
  isAmountSelectDisabled,
  availableAgencies,
  submitForm,
  clearForm
} = useSaleForm(false, (sale: SaleFormData) => {
  $emits('action:save', sale);
});

// Expose methods to parent components
defineExpose({ clearForm });
</script>

<template>
  <form @submit.prevent="submitForm" class="p-4 space-y-4">
    <h1 class="title">Información de la venta</h1>

    <!-- Date Field -->
    <div class="form-field">
      <LabelForm for="fecha">Fecha</LabelForm>
      <InputGeneric id="fecha" placeholder="selecciona la fecha" type="date" v-model="saleForm.fecha" />
    </div>

    <!-- Agency Field -->
    <div class="form-field">
      <LabelForm for="agencia">Agencia</LabelForm>
      <InputSelect id="agencia" placeholder="Elige la Agencia" v-model="saleForm.agencia">
        <option v-for="agency in availableAgencies" :key="agency.agencia" :value="agency.agencia">
          {{ agency.agencia }}
        </option>
      </InputSelect>
    </div>

    <!-- Client Field -->
    <div class="form-field">
      <LabelForm for="cliente">Cliente</LabelForm>
      <InputGeneric id="cliente" placeholder="Ingresa el nombre" type="text" v-model="saleForm.nombreCliente" />
    </div>

    <!-- Type Field -->
    <div class="form-field">
      <LabelForm for="tipo">Tipo</LabelForm>
      <InputSelect id="tipo" placeholder="Elige el tipo" v-model="saleForm.tipo">
        <option value="Nuevo">Nuevo</option>
        <option value="Renovación">Renovación</option>
      </InputSelect>
    </div>

    <!-- Level Field -->
    <div class="form-field">
      <LabelForm for="nivel">Nivel</LabelForm>
      <InputSelect id="nivel" placeholder="Elige el Nivel" v-model="saleForm.nivel">
        <option value="DIAMANTE">DIAMANTE</option>
        <option value="NUEVO">NUEVO</option>
        <option value="PREMIUM">PREMIUM</option>
        <option value="LEAL">LEAL</option>
        <option value="NOBEL">NOBEL</option>
        <option value="VIP">VIP</option>
      </InputSelect>
    </div>

    <!-- Term Field -->
    <div class="form-field">
      <LabelForm for="plazo">Plazo</LabelForm>
      <InputSelect id="plazo" placeholder="Elige el Plazo" v-model="saleForm.plazo">
        <option value="16">16</option>
        <option value="21">21</option>
        <option value="26">26</option>
      </InputSelect>
    </div>

    <!-- Amount Field -->
    <div class="form-field">
      <LabelForm for="monto">Monto</LabelForm>
      <InputSelect id="monto" placeholder="Elige el Monto" v-model="saleForm.monto"
        :is-disabled="isAmountSelectDisabled">
        <option v-for="(amount, index) in availableAmounts" :key="`${amount}-${index}`" :value="amount">
          {{ toCurrency(Number(amount)) }}
        </option>
      </InputSelect>
    </div>

    <!-- First Payment Field -->
    <div class="form-field">
      <LabelForm for="pago">1er Pago</LabelForm>
      <InputSelect id="pago" placeholder="Elige el pago" v-model="saleForm.primerPago" :is-disabled="true">
        <option :value="saleForm.primerPago">
          {{ toCurrency(Number(saleForm.primerPago)) }}
        </option>
      </InputSelect>
    </div>

    <!-- Submit Button -->
    <button :disabled="isDisabled" class="btn btn-primary w-full disabled:bg-opacity-60">
      Guardar
    </button>
  </form>
</template>

<style scoped>
.form-field {
  @apply space-y-2;
}
</style>