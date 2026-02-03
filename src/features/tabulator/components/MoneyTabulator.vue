<script setup lang="ts">
import { watch, onBeforeMount } from 'vue'
import type { MoneyTabulation, TabulationFormData } from '../types'
import { useDenominationCalculations } from '../composables'

// Components
import DenominationRow from './DenominationRow.vue'
import TabulationSummary from './TabulationSummary.vue'
import ClearTabulationButton from './ClearTabulationButton.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'

interface Emits {
  (e: 'submit:tabulation', formData: TabulationFormData, isUpdate: boolean): void
}

interface Props {
  tabulation?: MoneyTabulation
  hasCurrentWeekTabulation: boolean
}

const $emit = defineEmits<Emits>()
const $props = defineProps<Props>()

// Composables
const {
  // Computed
  billDenominations,
  coinDenominations,
  grandTotal,
  
  // Methods
  updateDenominationQuantity,
  clearAllDenominations,
  updateFromTabulation,
  generateFormData
} = useDenominationCalculations()

// Methods
function handleSubmit(): void {
  try {
    const formData = generateFormData()
    const isUpdate = $props.hasCurrentWeekTabulation
    console.log('FormData being emitted:', formData)
    $emit('submit:tabulation', formData, isUpdate)
  } catch (error) {
    console.error('Error generating form data:', error)
  }
}

function handleClearTabulation(): void {
  clearAllDenominations()
}

// Watchers & Lifecycle
watch(() => $props.tabulation, (tabulation) => {
  if (tabulation) {
    updateFromTabulation(tabulation)
  }
})

onBeforeMount(() => {
  if ($props.tabulation) {
    updateFromTabulation($props.tabulation)
  }
})
</script>

<template>
  <div v-if="!hasCurrentWeekTabulation" class="flex justify-end">
    <ClearTabulationButton @clear="handleClearTabulation" />
  </div>

  <form @submit.prevent="handleSubmit" class="space-y-8 p-2">
    <!-- Billetes -->
    <div class="space-y-4">
      <TextCT as="h3" variant="paragraph-bold">Billetes</TextCT>
      <DenominationRow
        v-for="(denomination, index) in billDenominations"
        :key="`bill-${denomination.value}`"
        :value="denomination.value"
        :quantity="denomination.quantity"
        :disabled="false"
        @update:quantity="(quantity) => updateDenominationQuantity(index, quantity)"
      />
    </div>

    <!-- Monedas -->
    <div class="space-y-4">
      <TextCT as="h3" variant="paragraph-bold">Monedas</TextCT>
      <DenominationRow
        v-for="(denomination, index) in coinDenominations"
        :key="`coin-${denomination.value}`"
        :value="denomination.value"
        :quantity="denomination.quantity"
        :disabled="false"
        @update:quantity="(quantity) => updateDenominationQuantity(billDenominations.length + index, quantity)"
      />
    </div>

    <!-- Grand total -->
    <TabulationSummary :total="grandTotal" />

    <BtnComponent
      type="submit"
      variant="primary"
      full-width
    >
      {{ hasCurrentWeekTabulation ? 'Actualizar' : 'Guardar' }}
    </BtnComponent>
  </form>
</template>