<script setup lang="ts">
import { onMounted } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { Disbursement, SaleFormData, SaleOrigin } from '../types'

// Components
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import LockIcon from '@/shared/components/icons/LockIcon.vue'

// Composables
import { useSaleForm } from '@/features/sale/composables/useSaleForm'

interface Props {
  isSaving: boolean
  /** Cuando viene, el plan del credito ya lo autorizo oficina y no se edita aqui. */
  disbursement?: Disbursement | null
}

const props = withDefaults(defineProps<Props>(), { disbursement: null })

// Emits
interface Emits {
  (event: 'submit', sale: SaleFormData): void
  (event: 'change-disbursement'): void
}

const emit = defineEmits<Emits>()

// Constants
const saleOriginOptions: SaleOrigin[] = ['agente', 'gerente']

// Inicializar composable
const {
  saleForm,
  availableAmounts,
  isAmountSelectDisabled,
  availableAgencies,
  isFromDisbursement,
  submitForm,
  clearForm,
  applyDisbursement
} = useSaleForm(false, (sale: SaleFormData) => {
  emit('submit', sale)
})

onMounted(() => {
  if (props.disbursement) applyDisbursement(props.disbursement)
})

// Expose methods to parent components
defineExpose({ clearForm })
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <!-- Resumen del desembolso: lo que ya esta decidido, visible y cerrado -->
    <section v-if="isFromDisbursement"
      class="space-y-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
      <header class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <LockIcon class="size-3.5" />
            Datos del desembolso
          </p>
          <p class="mt-1 truncate font-semibold capitalize text-slate-900">
            {{ saleForm.nombreCliente.toLowerCase() }}
          </p>
        </div>
        <button type="button"
          class="shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold text-blue-700 underline-offset-2 hover:bg-blue-100 hover:underline"
          @click="emit('change-disbursement')">
          Cambiar
        </button>
      </header>

      <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div><dt class="text-slate-500">Agencia</dt><dd class="font-medium text-slate-900">{{ saleForm.agencia }}</dd></div>
        <div><dt class="text-slate-500">Tipo</dt><dd class="font-medium text-slate-900">{{ saleForm.tipo }}</dd></div>
        <div><dt class="text-slate-500">Nivel</dt><dd class="font-medium text-slate-900">{{ saleForm.nivel }}</dd></div>
        <div><dt class="text-slate-500">Plazo</dt><dd class="font-medium text-slate-900">{{ saleForm.plazo }} semanas</dd></div>
        <div><dt class="text-slate-500">Monto</dt><dd class="font-bold tabular-nums text-slate-900">{{ toCurrency(Number(saleForm.monto)) }}</dd></div>
        <div><dt class="text-slate-500">1er pago</dt><dd class="font-bold tabular-nums text-slate-900">{{ toCurrency(Number(saleForm.primerPago)) }}</dd></div>
      </dl>

      <p class="text-xs leading-5 text-slate-500">
        Crédito {{ saleForm.prestamoId }}. Si algo no coincide, cambia el desembolso.
      </p>
    </section>

    <!-- Lo que sí decide el gerente -->
    <div class="form-field">
      <LabelForm for="fecha">Fecha de la venta</LabelForm>
      <InputGeneric id="fecha" placeholder="selecciona la fecha" type="date" v-model="saleForm.fecha" />
    </div>

    <fieldset class="form-field">
      <legend class="block text-sm font-medium text-gray-900 dark:text-white">
        ¿Quién generó la venta?
      </legend>
      <div class="grid grid-cols-2 gap-3">
        <label v-for="option in saleOriginOptions" :key="option" class="cursor-pointer">
          <input type="radio" name="generadaPor" class="peer sr-only" :value="option"
            v-model="saleForm.generadaPor" />
          <span
            class="block rounded-lg border border-slate-200 p-2.5 text-center text-sm capitalize text-gray-500 transition-colors peer-checked:border-blue-700 peer-checked:bg-blue-50 peer-checked:font-medium peer-checked:text-blue-700 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 dark:border-gray-600 dark:text-gray-400 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-950/40 dark:peer-checked:text-blue-400">
            {{ option }}
          </span>
        </label>
      </div>
    </fieldset>

    <!-- Captura manual: el plan se escribe aqui -->
    <template v-if="!isFromDisbursement">
      <div class="form-field">
        <LabelForm for="agencia">Agencia</LabelForm>
        <InputSelect id="agencia" placeholder="Elige la Agencia" v-model="saleForm.agencia">
          <option v-for="agency in availableAgencies" :key="agency.agencia" :value="agency.agencia">
            {{ agency.agencia }}
          </option>
        </InputSelect>
      </div>

      <div class="form-field">
        <LabelForm for="cliente">Cliente</LabelForm>
        <InputGeneric id="cliente" placeholder="Ingresa el nombre" type="text" v-model="saleForm.nombreCliente" />
      </div>

      <div class="form-field">
        <LabelForm for="tipo">Tipo</LabelForm>
        <InputSelect id="tipo" placeholder="Elige el tipo" v-model="saleForm.tipo">
          <option value="Nuevo">Nuevo</option>
          <option value="Renovación">Renovación</option>
        </InputSelect>
      </div>

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

      <div class="form-field">
        <LabelForm for="plazo">Plazo</LabelForm>
        <InputSelect id="plazo" placeholder="Elige el Plazo" v-model="saleForm.plazo">
          <option value="16">16</option>
          <option value="21">21</option>
          <option value="26">26</option>
        </InputSelect>
      </div>

      <div class="form-field">
        <LabelForm for="monto">Monto</LabelForm>
        <InputSelect id="monto" placeholder="Elige el Monto" v-model="saleForm.monto"
          :is-disabled="isAmountSelectDisabled">
          <option v-for="(amount, index) in availableAmounts" :key="`${amount}-${index}`" :value="amount">
            {{ toCurrency(Number(amount)) }}
          </option>
        </InputSelect>
      </div>

      <div class="form-field">
        <LabelForm for="pago">1er Pago</LabelForm>
        <InputSelect id="pago" placeholder="Elige el pago" v-model="saleForm.primerPago" :is-disabled="true">
          <option :value="saleForm.primerPago">
            {{ toCurrency(Number(saleForm.primerPago)) }}
          </option>
        </InputSelect>
      </div>
    </template>

    <!-- Submit Button -->
    <BtnComponent
      type="submit"
      variant="primary"
      full-width
      :disabled="isSaving"
      :loading="isSaving"
    >
      Registrar venta
    </BtnComponent>
  </form>
</template>

<style scoped>
.form-field {
  @apply space-y-2;
}
</style>
