<script setup lang="ts">
import { computed } from 'vue'
import { ROUTE_NAME } from '@/router'
import { toCurrency, getPreviousWeek } from '@/shared/utils'
import { useCierreSemanal } from '@/features/weekly-close/composables/useCierreSemanal'
import { useRouter } from 'vue-router'
import type { ModalConfigKey } from '@/features/weekly-close/types'
import { ArrowRight } from 'lucide-vue-next'
import DataField from '@/shared/components/DataField.vue'
import EditableField from './EditableField.vue'
import InfoIcon from '@/shared/components/icons/InfoIcon.vue'

interface Emits {
  (event: 'action:show-modal', campo: ModalConfigKey): void
}

/**
 * ------------------------------------------
 *	Composables & Stores
 * ------------------------------------------
 */
const router = useRouter()

// Usar el nuevo composable principal
const {
  // Estado
  weeklyClose,
  agency,
  currentDate,
  isClosingLocked,
  
  // Cálculos
  totalAgentIncome,
  totalAgentExpenses,
  totalAssignmentsAmount,
  remainingCash,
} = useCierreSemanal()

const emit = defineEmits<Emits>()

/**
 * ------------------------------------------
 *	Computed
 * ------------------------------------------
 */
const previousWeek = computed(() => getPreviousWeek(currentDate.value.week, currentDate.value.year))

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */
const handleShowWeekDetails = () => {
  router.push({
    name: ROUTE_NAME.COMMISSIONS_DETAILS,
  })
}
</script>

<template>
  <!--* Ingresos del Agente -->
  <div v-if="weeklyClose" class="space-y-3 rounded-lg border bg-white p-4">
    <div class="mb-4">
      <h2 class="title">Ingresos del Agente</h2>
      <p class="subtitle">
        Este resumen refleja el total de ingresos generados por el agente en la semana actual
      </p>
    </div>

    <DataField label="Cobranza Pura" :value="toCurrency(weeklyClose?.ingresosAgente.cobranzaPura)" />
    <DataField label="Monto Excedente" :value="toCurrency(weeklyClose?.ingresosAgente.montoExcedente)" />
    <DataField label="Liquidaciones" :value="weeklyClose?.ingresosAgente.liquidaciones" />
    <EditableField
      label="Multas"
      :value="weeklyClose?.ingresosAgente.multas"
      modal-key="multas"
      :is-locked="isClosingLocked"
      @edit="emit('action:show-modal', $event)"
    />

    <EditableField
      label="Otros"
      :value="weeklyClose?.ingresosAgente.otrosIngresos"
      modal-key="otrosIngresosAgente"
      :is-locked="isClosingLocked"
      :has-reason="true"
      :reason-text="weeklyClose?.ingresosAgente.motivoOtrosIngresos"
      reason-modal-key="motivoOtrosIA"
      @edit="emit('action:show-modal', $event)"
    />

    <hr class="line" />

    <DataField label="Total de ingresos" :value="toCurrency(totalAgentIncome)" />
  </div>

  <!-- / Ingresos del Agente -->

  <!--* Comisiones -->
  <div class="space-y-3 rounded-lg border bg-white p-4">
    <div class="mb-4">
      <h2 class="title">Comisiones</h2>
      <p class="subtitle">Estructura de Comisiones del Agente</p>
    </div>

    <DataField label="% Por cobranza" :value="`${weeklyClose?.egresosGerente.porcentajePorCobranzaPagadoEnSemana} %`" />
    <DataField label="% Bono Mensual" value="%" />
  </div>
  <!-- / Comisiones -->

  <!--* Egresos del Agente -->
  <div class="space-y-3 rounded-lg border bg-white p-4">
    <div class="mb-4">
      <h2 class="title">Egresos del Agente</h2>
      <p class="subtitle">
        Este resumen refleja el total de egresos generados por el agente en la semana actual
      </p>
    </div>

    <DataField label="Asignaciones previas" :value="toCurrency(totalAssignmentsAmount)" />

    <EditableField
      label="Otros"
      :value="weeklyClose?.egresosAgente.otrosEgresos"
      modal-key="otrosEgresosAgente"
      :is-locked="isClosingLocked"
      :has-reason="true"
      :reason-text="weeklyClose?.egresosAgente.motivoOtrosEgresos"
      reason-modal-key="motivoOtrosEA"
      @edit="emit('action:show-modal', $event)"
    />

    <EditableField
      label="Efectivo Entregado"
      :value="weeklyClose?.egresosAgente.efectivoEntregadoCierre"
      modal-key="efectivoEntregado"
      :is-locked="isClosingLocked"
      @edit="emit('action:show-modal', $event)"
    />

    <hr class="line" />

     <DataField label="Total de egresos" :value="toCurrency(totalAgentExpenses)" />
  </div>
  <!-- / Egresos del Agente -->

  <!--* Egresos del Gerente -->
  <div class="space-y-3 rounded-lg border bg-white p-4">
    <div class="mb-4">
      <h2 class="title">Egresos del Gerente</h2>
      <p class="subtitle">
        Este resumen refleja el total de egresos generados por el gerente en la semana actual
      </p>
    </div>

    <div class="p-4 border-2 rounded-lg space-y-4 border-slate-100">
      <div class="flex gap-4">
        <InfoIcon class="size-6 shrink-0 text-blue-500" />
        <p class="font-sm-700 text-blue-800">
          {{ agency?.agencia }}, estás realizando el pago de comisiones correspondientes a la
          <span class="btn-manual-number">semana {{ previousWeek }}</span>
          (semana anterior). Para más detalles, haz clic en el siguiente botón
        </p>
      </div>

      <button 
        @click="handleShowWeekDetails" 
        class="btn-primary-outline !btn-sm flex items-center justify-center gap-2"
      >
        <span>Ver Detalles de Semana {{ previousWeek }}</span>
        <ArrowRight class="h-4 w-4" />
      </button>
    </div>

    <DataField label="Comisión por cobranza" :value="toCurrency(weeklyClose?.egresosGerente.comisionCobranzaPagadaEnSemana)"/>
    <DataField label="Comisión por ventas" :value="toCurrency(weeklyClose?.egresosGerente.comisionVentasPagadaEnSemana)"/>

    <EditableField
      label="Bonos"
      :value="weeklyClose?.egresosGerente.bonosPagadosEnSemana"
      modal-key="bonos"
      :is-locked="isClosingLocked"
      @edit="emit('action:show-modal', $event)"
    />

    <hr class="line" />

    <div class="flex justify-between gap-2">
      <p class="font-bold text-blue-700">Efectivo Restante</p>
      <p class="font-bold text-blue-800">
        {{ toCurrency(remainingCash) }}
      </p>
    </div>
  </div>
  <!-- / Egresos del Gerente -->
</template>