<script setup lang="ts">
import { computed } from 'vue'
import { ROUTE_NAME } from '@/router'
import { toCurrency, getPreviousWeek } from '@/shared/utils'
import { useWeeklyClose } from '@/features/weekly-close/composables/useWeeklyClose'
import { useRouter } from 'vue-router'
import type { ModalConfigKey } from '@/features/weekly-close/types'
import { ArrowRight, ChevronDown } from 'lucide-vue-next'
import DataField from '@/shared/components/DataField.vue'
import EditableField from './EditableField.vue'
import InfoIcon from '@/shared/components/icons/InfoIcon.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import DataItemCT from '@/shared/components/ui/DataItemCT.vue'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

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
  remainingCash,
} = useWeeklyClose()

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
  <CardContainer v-if="weeklyClose" title="Comisiones">
    <TextCT>Estructura de Comisiones del Agente 2</TextCT>

    <!-- Datos principales siempre visibles -->
    <DataField
      label="Nivel de comisión"
      :value="weeklyClose.comisiones.nivelComision"
    />
    <DataField
      label="% Por cobranza"
      :value="`${weeklyClose.comisiones.porcentajeComisionCobranza}%`"
    />
    <DataField
      label="Comisión Total"
      :value="toCurrency(weeklyClose.comisiones.comisionTotal)"
    />

    <!-- Detalles adicionales en collapsible -->
    <Collapsible v-slot="{ open }" class="mt-2">
      <CollapsibleTrigger class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
        <ChevronDown
          class="h-4 w-4 transition-transform duration-300 ease-in-out"
          :class="{ 'rotate-180': open }"
        />
        <TextCT variant="secondary">{{ open ? 'Ocultar detalles' : 'Ver detalles completos' }}</TextCT>
      </CollapsibleTrigger>

      <CollapsibleContent class="mt-3 grid grid-cols-2 gap-2">
        <DataItemCT
          label="Clientes pago completo"
          :value="weeklyClose.comisiones.clientesPagoCompleto"
        />
        <DataItemCT
          label="Recuperación al jueves"
          :value="`${weeklyClose.comisiones.recuperacionAlJueves}%`"
        />
        <DataItemCT
          label="Cobranza pura"
          :value="toCurrency(weeklyClose.comisiones.cobranzaPura)"
        />
        <DataItemCT
          label="Excedente"
          :value="toCurrency(weeklyClose.comisiones.excedente)"
        />
        <DataItemCT
          label="Primeros pagos"
          :value="weeklyClose.comisiones.primerosPagos"
        />
        <DataItemCT
          label="Número de ventas"
          :value="weeklyClose.comisiones.numeroVentas"
        />
        <DataItemCT
          label="Base de comisión"
          :value="toCurrency(weeklyClose.comisiones.baseComision)"
        />
        <DataItemCT
          label="Comisión por cobranza"
          :value="toCurrency(weeklyClose.comisiones.pagoComisionCobranza)"
        />
        <DataItemCT
          label="Comisión por ventas"
          :value="toCurrency(weeklyClose.comisiones.pagoComisionVentas)"
        />
        <DataItemCT
          label="Comisión semanal"
          :value="toCurrency(weeklyClose.comisiones.comisionSemanal)"
        />

        <!-- Información de bonos -->
        <div v-if="weeklyClose.comisiones.pagoBono.aplicaPagoBono" class="pt-2 mt-2 border-t">
          <TextCT variant="paragraph-bold" class="mb-2">Bono Mensual</TextCT>
          <DataField
            label="% Bono mensual"
            :value="`${weeklyClose.comisiones.pagoBono.porcentajeBonoMensual}%`"
          />
          <DataField
            label="Mes del bono"
            :value="weeklyClose.comisiones.pagoBono.mesBono || 'N/A'"
          />
          <DataField
            label="Monto del bono"
            :value="toCurrency(weeklyClose.comisiones.pagoBono.bonos)"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  </CardContainer>
  <!-- / Comisiones -->

  <!--* Egresos del Agente -->
  <CardContainer title="Egresos del Agente">
    <TextCT >
      Este resumen refleja el total de egresos generados por el agente en la semana actual
    </TextCT>

    <DataField label="Asignaciones previas" :value="toCurrency(weeklyClose?.egresosAgente.asignaciones)" />

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
  <CardContainer title="Egresos del Gerente">
    <TextCT>
      Este resumen refleja el total de egresos generados por el gerente en la semana actual
    </TextCT>

    <!--
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
    -->

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