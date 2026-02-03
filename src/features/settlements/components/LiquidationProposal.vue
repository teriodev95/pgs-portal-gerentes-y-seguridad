<script setup lang="ts">
import CardContainer from '@/shared/components/CardContainer.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import { toCurrency } from '@/shared/utils'

interface LiquidationOption {
  percentage: number
  discount: string
  amount: number
}

interface Props {
  pendingBalance: number
  liquidationOptions: LiquidationOption[]
  selectedDiscountPercentage: number
}

interface Emits {
  (e: 'select-option', percentage: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function selectLiquidationOption(percentage: number) {
  emit('select-option', percentage)
}
</script>

<template>
  <card-container title="Propuesta de Liquidación">
    <text-c-t>
      El cliente tiene un saldo pendiente de
      <span class="font-semibold">{{ toCurrency(pendingBalance) }}</span>.
      Las siguientes opciones aplican un descuento sobre este saldo para incentivar el cierre.
    </text-c-t>

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
              :disabled="false"
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
            {{ toCurrency(option.amount) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Settlement Processor Slot -->
    <div class="mt-4">
      <slot name="processor" />
    </div>

    <!-- Alert and Action Slots -->
    <div class="mt-6 space-y-2">
      <slot name="alert" />
      <slot name="action" :selectedDiscountPercentage="selectedDiscountPercentage" :selectLiquidationOption="selectLiquidationOption" />
    </div>
  </card-container>
</template>