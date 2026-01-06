<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
    <div class="flex items-center gap-2 mb-4">
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900">Balance del Negocio</h3>
    </div>

    <p class="text-sm text-gray-600 mb-4">
      Comparativa entre inversión realizada y recuperación real.
    </p>

    <div class="space-y-4">
      <!-- Total Investment -->
      <div class="flex justify-between items-center">
        <div>
          <div class="text-sm text-gray-600">Inversión Total</div>
          <div class="text-xs text-gray-500">(Préstamo + Comisiones)</div>
        </div>
        <div class="text-lg font-semibold text-gray-900">
          {{ formatCurrency(settlement.por_recuperar) }}
        </div>
      </div>

      <!-- Recovery -->
      <div class="flex justify-between items-center">
        <div>
          <div class="text-sm text-gray-600">Recuperado</div>
          <div class="text-xs text-gray-500">(Pagos del Cliente)</div>
        </div>
        <div class="text-lg font-semibold text-green-600">
          {{ formatCurrency(settlement.cobrado) }}
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-200"></div>

      <!-- Capital at Risk -->
      <div class="flex justify-between items-center">
        <div>
          <div class="text-sm font-medium text-gray-900">CAPITAL EN RIESGO</div>
          <div class="text-xs text-gray-500">Necesario para punto de equilibrio</div>
        </div>
        <div class="text-lg font-bold text-red-600">
          {{ formatCurrency(settlement.faltante) }}
        </div>
      </div>
    </div>

    <!-- Commission Breakdown Link -->
    <div class="mt-4 pt-4 border-t border-gray-100">
      <button
        class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        @click="toggleCommissionBreakdown"
      >
        {{ showCommissions ? 'Ocultar desglose de comisiones' : 'Ver desglose de comisiones' }}
        <svg
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-90': showCommissions }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>

    <!-- Commission Breakdown Details -->
    <div v-if="showCommissions" class="mt-4 pt-4 border-t border-gray-100">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Desglose de Comisiones</h4>

      <div class="space-y-3">
        <!-- Collection Commission -->
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-600">Comisión de Cobranza</div>
          <div class="text-sm font-medium text-gray-900">
            {{ formatCurrency(settlement.comision_cobranza) }}
          </div>
        </div>

        <!-- Sales Commission -->
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-600">Comisión de Venta</div>
          <div class="text-sm font-medium text-gray-900">
            {{ formatCurrency(settlement.comision_venta) }}
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200"></div>

        <!-- Total Commission -->
        <div class="flex justify-between items-center">
          <div class="text-sm font-semibold text-gray-900">Total Comisiones</div>
          <div class="text-sm font-bold text-blue-600">
            {{ formatCurrency(settlement.comision_total) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ISpecialSettlement } from '../types'


interface Props {
  settlement: ISpecialSettlement
  formatCurrency: (amount: number) => string
}

defineProps<Props>()

const showCommissions = ref(false)

function toggleCommissionBreakdown() {
  showCommissions.value = !showCommissions.value
}
</script>