<script lang="ts" setup>
import { computed } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { IAgencyFinancialSummary } from '../types/agency.types'
import CalendarIcon from '@/shared/components/icons/CalendarIcon.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import DataField from '@/shared/components/DataField.vue'

interface Props {
  isVisible: boolean
  dateValue?: string
  dashboardData?: IAgencyFinancialSummary
  isLoading: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'dateChange', event: Event): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const hasData = computed(() => !!props.dashboardData)
</script>

<template>
  <div class="space-y-2">
    <!-- Calendar Toggle Button -->
    <div class="flex items-center justify-between gap-2">
      <h5 class="title">Datos Generales</h5>
      <div 
        class="rounded-lg border bg-slate-100 p-2 hover:bg-blue-500 hover:text-white cursor-pointer"
        @click="emit('toggle')"
      >
        <CalendarIcon />
      </div>
    </div>

    <!-- Date Picker Content -->
    <div v-if="isVisible" class="space-y-4">
      <!-- Date Input -->
      <div class="space-y-2">
        <label for="date_selector" class="block text-sm font-medium text-gray-900 dark:text-white">
          Seleccione la fecha
        </label>
        <input 
          type="date" 
          :value="dateValue" 
          @change="emit('dateChange', $event)" 
          id="date_selector"
          class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          required 
        />
      </div>

      <!-- Dashboard Data Display -->
      <div v-if="hasData" class="space-y-2">
        <DataField label="Gerencia" :value="dashboardData!.gerencia" />
        <DataField label="Agencia" :value="dashboardData!.agencia" />
        <DataField label="Semana" :value="dashboardData!.semana" />
        <DataField label="Año" :value="dashboardData!.anio" />
        <DataField label="Clientes" :value="dashboardData!.clientes" />
        <DataField label="Clientes Cobrados" :value="dashboardData!.clientesCobrados" />
        <DataField label="Cobranza Total" :value="toCurrency(dashboardData!.cobranzaTotal)" />
        <DataField label="Débito Total" :value="toCurrency(dashboardData!.debitoTotal)" />
        <DataField label="Número Liquidaciones" :value="dashboardData!.numeroLiquidaciones" />
        <DataField label="Liquidaciones" :value="toCurrency(dashboardData!.liquidaciones)" />
        <DataField 
          v-if="dashboardData!.montoDeDebitoFaltante" 
          label="Débito Faltante" 
          :value="toCurrency(dashboardData!.montoDeDebitoFaltante)" 
        />
        <DataField label="Monto Excedente" :value="toCurrency(dashboardData!.montoExcedente)" />
        <DataField label="Multas" :value="toCurrency(dashboardData!.multas)" />
        <DataField label="No Pagos" :value="dashboardData!.noPagos" />
        <DataField label="Pagos Reducidos" :value="dashboardData!.pagosReducidos" />
        <DataField label="Total Cobranza Pura" :value="toCurrency(dashboardData!.totalCobranzaPura)" />
        <DataField label="Total Descuento" :value="toCurrency(dashboardData!.totalDeDescuento)" />
      </div>

      <!-- Loading State -->
      <LoadSkeleton v-else-if="isLoading" :items="6" />

      <!-- Empty State -->
      <div v-else>
        <h2 class="text-lg">Por favor inserte la fecha</h2>
      </div>
    </div>
  </div>
</template>