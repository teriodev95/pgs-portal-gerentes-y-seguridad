<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Propuesta de Liquidación</h3>

    <div class="mb-4">
      <p class="text-sm text-gray-600 mb-4">
        El cliente tiene un saldo pendiente de
        <span class="font-semibold">{{ formatCurrency(pendingBalance) }}</span>.
        Las siguientes opciones aplican un descuento sobre este saldo para incentivar el cierre.
      </p>
    </div>

    <div class="space-y-3">
      <div
        v-for="option in liquidationOptions"
        :key="option.percentage"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        :class="{ 'ring-2 ring-blue-500 bg-blue-50': selectedDiscountPercentage === option.percentage }"
        @click="selectLiquidationOption(option.percentage)"
      >
        <!-- Radio Button -->
        <div class="flex items-center">
          <div class="flex items-center h-5">
            <input
              :id="`option-${option.percentage}`"
              name="liquidation-option"
              type="radio"
              :disabled="!canSettle"
              :value="option.percentage"
              :checked="selectedDiscountPercentage === option.percentage"
              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
              @change="selectLiquidationOption(option.percentage)"
            />
          </div>
          <div class="ml-3">
            <label
              :for="`option-${option.percentage}`"
              class="text-sm font-medium text-gray-900 cursor-pointer"
            >
              {{ option.percentage }}% {{ option.discount }}
            </label>
            <div class="text-xs text-gray-500">
              Monto a Pagar
            </div>
          </div>
        </div>

        <!-- Amount -->
        <div class="text-right">
          <div class="text-lg font-semibold text-gray-900">
            {{ formatCurrency(option.amount) }}
          </div>
        </div>
      </div>
    </div>

    
    <!-- Action Button -->
    <div class="mt-6 space-y-2">
      <AlertMsg v-if="!canSettle" type="danger" message="Este préstamo aún no cumple las 52 semanas requeridas para Liquidación especial"/>
      <button
        @click="$emit('create-settlement')"
        :disabled="selectedDiscountPercentage === 0 || !canSettle"
        class="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Selecciona una Opción
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AlertMsg from '@/shared/components/AlertMsg.vue'

interface LiquidationOption {
  percentage: number
  discount: string
  amount: number
}

interface Props {
  canSettle: boolean
  pendingBalance: number
  liquidationOptions: LiquidationOption[]
  selectedDiscountPercentage: number
  formatCurrency: (amount: number) => string
}

interface Emits {
  (e: 'select-option', percentage: number): void
  (e: 'create-settlement'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function selectLiquidationOption(percentage: number) {
  emit('select-option', percentage)
}
</script>