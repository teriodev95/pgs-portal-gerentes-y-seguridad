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
import CardContainer from '@/shared/components/CardContainer.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

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
  <CardContainer v-if="weeklyClose" title="Ingresos del Agente">
    <TextCT>
      Este resumen refleja el total de ingresos generados por el agente en la semana actual
    </TextCT>

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
  </CardContainer>

  <!-- / Ingresos del Agente -->

  <!--* Comisiones -->
  <CardContainer title="Comisiones">
    <TextCT>Estructura de Comisiones del Agente</TextCT>
    <DataField label="% Por cobranza" :value="`${weeklyClose?.egresosGerente.porcentajePorCobranzaPagadoEnSemana} %`" />
    <DataField label="% Bono Mensual" value="%" />
  </CardContainer>
  <!-- / Comisiones -->

  <!--* Egresos del Agente -->
  <CardContainer title="Egresos del Agente">
    <TextCT >
      Este resumen refleja el total de egresos generados por el agente en la semana actual
    </TextCT>

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
  </CardContainer>
  <!-- / Egresos del Agente -->

  <!--* Egresos del Gerente -->
  <CardContainer title="Egresos del Gerenete">
    <TextCT>
      Este resumen refleja el total de egresos generados por el gerente en la semana actual
    </TextCT>

    <div class="p-4 border-2 rounded-lg space-y-4 border-slate-100">
      <div class="flex gap-4">
        <InfoIcon class="size-6 shrink-0 text-blue-500" />
        <TextCT as="span" variant="tertiary">
          {{ agency?.agencia }}, estás realizando el pago de comisiones correspondientes a la
          <TextCT as="span" variant="paragraph-bold">semana {{ previousWeek }}</TextCT>
          (semana anterior). Para más detalles, haz clic en el siguiente botón
        </TextCT>
      </div>

      <BtnComponent 
        @click="handleShowWeekDetails" 
        variant="primary" outline full-width
      >
        <span>Ver Detalles de Semana {{ previousWeek }}</span>
        <template #icon-right>
          <ArrowRight class="h-4 w-4" />
        </template>
      </BtnComponent>
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

    <DataField label="Efectivo Restante" :value="toCurrency(remainingCash)"   />
  </CardContainer>
  <!-- / Egresos del Gerente -->
</template>