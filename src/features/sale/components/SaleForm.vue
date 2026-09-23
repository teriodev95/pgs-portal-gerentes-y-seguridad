<script setup lang="ts">
import { onMounted } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { ApprovedRequest, SaleFormData, SaleOrigin } from '../types'

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
  /** Cuando viene, el plan del credito ya esta autorizado y no se edita aqui. */
  request?: ApprovedRequest | null
}

const props = withDefaults(defineProps<Props>(), { request: null })

// Emits
interface Emits {
  (event: 'submit', sale: SaleFormData): void
  (event: 'change-request'): void
}

const emit = defineEmits<Emits>()

// Constants
/** Cada opcion dice lo que decide en Comisiones: la venta del gerente no paga bono de venta al agente. */
const saleOriginOptions: { value: SaleOrigin; label: string; detail: string }[] = [
  { value: 'agente', label: 'Agente', detail: 'Sí genera comisión de venta al agente' },
  { value: 'gerente', label: 'Gerente', detail: 'No genera comisión de venta al agente' },
]

// Inicializar composable
const {
  saleForm,
  availableAmounts,
  isAmountSelectDisabled,
  availableAgencies,
  isFromRequest,
  submitForm,
  clearForm,
  applyRequest
} = useSaleForm(false, (sale: SaleFormData) => {
  emit('submit', sale)
})

onMounted(() => {
  if (props.request) applyRequest(props.request)
})

// Expose methods to parent components
defineExpose({ clearForm })
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <!-- Resumen del desembolso: lo que ya esta decidido, visible y cerrado -->
    <section v-if="isFromRequest"
      class="space-y-3 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
      <header class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <LockIcon class="size-3.5" />
            Datos de la solicitud aprobada
          </p>
          <p class="mt-1 truncate font-semibold capitalize text-slate-900">
            {{ saleForm.nombreCliente.toLowerCase() }}
          </p>
        </div>
        <button type="button"
          class="shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold text-blue-700 underline-offset-2 hover:bg-blue-100 hover:underline"
          @click="emit('change-request')">
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
        Vistos buenos completos. Si algo no coincide, cambia la solicitud.
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
        <label v-for="option in saleOriginOptions" :key="option.value" class="cursor-pointer">
          <input type="radio" name="generadaPor" class="peer sr-only" :value="option.value"
            v-model="saleForm.generadaPor" />
          <span
            class="block h-full rounded-lg border border-slate-200 p-2.5 text-center text-gray-500 transition-colors peer-checked:border-blue-700 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 dark:border-gray-600 dark:text-gray-400 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-950/40 dark:peer-checked:text-blue-400">
            <span class="block text-sm font-medium">{{ option.label }}</span>
            <span class="mt-1 block text-xs leading-4"
              :class="option.value === 'gerente' ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'">
              {{ option.detail }}
            </span>
          </span>
        </label>
      </div>
    </fieldset>

    <!-- Captura manual: el plan se escribe aqui -->
    <template v-if="!isFromRequest">
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
