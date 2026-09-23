<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { ApprovedRequest, SaleFormData, SaleOrigin } from '../types'

// Components
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import ChoiceChips, { type ChoiceOption } from '@/shared/components/forms/ChoiceChips.vue'
import DateQuickPicker from '@/shared/components/forms/DateQuickPicker.vue'
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
const saleOriginOptions: ChoiceOption<SaleOrigin>[] = [
  { value: 'agente', label: 'Agente', detail: 'Sí genera comisión de venta al agente', tone: 'positive' },
  { value: 'gerente', label: 'Gerente', detail: 'No genera comisión de venta al agente', tone: 'negative' },
]

const tipoOptions: ChoiceOption<SaleFormData['tipo']>[] = [
  { value: 'Nuevo', label: 'Nuevo', detail: 'Cliente nuevo, nivel NUEVO' },
  { value: 'Renovación', label: 'Renovación', detail: 'Cliente que ya tuvo crédito' },
]

// Inicializar composable
const {
  saleForm,
  availableAmounts,
  availableTerms,
  availableLevels,
  availableAgencies,
  isFromRequest,
  submitForm,
  clearForm,
  applyRequest
} = useSaleForm(false, (sale: SaleFormData) => {
  emit('submit', sale)
})

/** Codigo y agente: el gerente reconoce a su gente por nombre, no por clave. */
const agencyOptions = computed<ChoiceOption<string>[]>(() =>
  availableAgencies.value.map((agency) => ({
    value: agency.agencia,
    label: agency.agencia,
    detail: agency.agente ? agency.agente.split(' ').slice(0, 2).join(' ') : 'Vacante',
  }))
)

const levelOptions = computed<ChoiceOption<string>[]>(() =>
  availableLevels.value.map((nivel) => ({ value: nivel, label: nivel }))
)

const termOptions = computed<ChoiceOption<string>[]>(() =>
  availableTerms.value.map((plazo) => ({ value: plazo, label: `${plazo} semanas` }))
)

/** Montos del plan elegido, como en la tabla de cargos: todos a la vista, un toque. */
const amountOptions = computed<ChoiceOption<number>[]>(() =>
  availableAmounts.value.map((monto) => ({
    value: Number(monto),
    label: toCurrency(Number(monto)).replace(/\.00$/, ''),
  }))
)

/** Con tipo Nuevo el nivel ya esta decidido; solo en Renovación se elige. */
const asksLevel = computed(() => saleForm.value.tipo === 'Renovación')

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
    <fieldset class="form-field">
      <legend class="form-legend">Fecha de la venta</legend>
      <DateQuickPicker v-model="saleForm.fecha" />
    </fieldset>

    <fieldset class="form-field">
      <legend class="form-legend">¿Quién generó la venta?</legend>
      <ChoiceChips v-model="saleForm.generadaPor" name="Quién generó la venta" :options="saleOriginOptions" />
    </fieldset>

    <!-- Captura manual: el plan se escribe aqui -->
    <template v-if="!isFromRequest">
      <fieldset class="form-field">
        <legend class="form-legend">Agencia</legend>
        <ChoiceChips v-if="agencyOptions.length" v-model="saleForm.agencia" name="Agencia" :options="agencyOptions" />
        <p v-else class="form-hint">Elige primero una gerencia en el menú.</p>
      </fieldset>

      <div class="form-field">
        <LabelForm for="cliente">Cliente</LabelForm>
        <InputGeneric id="cliente" placeholder="Nombre completo" type="text" v-model="saleForm.nombreCliente" />
      </div>

      <fieldset class="form-field">
        <legend class="form-legend">Tipo</legend>
        <ChoiceChips v-model="saleForm.tipo" name="Tipo" :options="tipoOptions" />
      </fieldset>

      <fieldset v-if="asksLevel" class="form-field">
        <legend class="form-legend">Nivel</legend>
        <ChoiceChips v-model="saleForm.nivel" name="Nivel" :options="levelOptions" :columns="3" size="sm" />
      </fieldset>

      <fieldset class="form-field">
        <legend class="form-legend">Plazo</legend>
        <ChoiceChips v-model="saleForm.plazo" name="Plazo" :options="termOptions" :columns="3" size="sm" />
      </fieldset>

      <fieldset class="form-field">
        <legend class="form-legend">
          Monto
          <span class="ml-1 font-normal text-slate-500">{{ saleForm.nivel }} · {{ saleForm.plazo }} sem</span>
        </legend>
        <ChoiceChips v-if="amountOptions.length" v-model="saleForm.monto" name="Monto" :options="amountOptions"
          :columns="3" size="sm" />
        <p v-else class="form-hint">Elige nivel y plazo para ver los montos de la tabla de cargos.</p>
      </fieldset>

      <!-- Resultado, no decision: el primer pago lo dicta la tabla de cargos -->
      <div class="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors"
        :class="saleForm.monto
          ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30'
          : 'border-dashed border-slate-200 dark:border-gray-600'">
        <span class="text-sm text-slate-600 dark:text-gray-300">1er pago</span>
        <span class="text-lg font-bold tabular-nums"
          :class="saleForm.monto ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-gray-600'">
          {{ saleForm.monto ? toCurrency(Number(saleForm.primerPago)) : '—' }}
        </span>
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
.form-legend {
  @apply block text-sm font-medium text-gray-900 dark:text-white;
}
.form-hint {
  @apply rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-500 dark:border-gray-600 dark:text-gray-400;
}
</style>
