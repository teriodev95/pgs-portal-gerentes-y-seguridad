<script setup lang="ts">
import { ChevronDown, Smartphone } from 'lucide-vue-next'
import { formatPhone } from '@/shared/utils/phone'
import CashAmountCell from './CashAmountCell.vue'
import type { CashContactContext, ManagementCash } from '../cash-report.types'
import { formatCurrency } from '../cash-report.utils'

const props = defineProps<{ management: ManagementCash }>()
const emit = defineEmits<{ contact: [context: CashContactContext] }>()

function contact(concept: string, amount: number) {
  emit('contact', {
    gerencia: props.management.gerencia,
    responsable: props.management.responsable,
    concepto: concept,
    monto: amount
  })
}
</script>

<template>
  <section class="bg-white px-4 py-5 sm:px-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-bold text-slate-950">{{ management.gerencia }}</h2>
        <p class="mt-0.5 text-sm text-slate-700">
          {{ management.responsable.nombre || management.gerente || 'Sin responsable asignado' }}
        </p>
        <p class="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Smartphone class="size-3.5" aria-hidden="true" />
          {{ formatPhone(management.responsable.telefono) || 'Sin teléfono registrado' }}
        </p>
      </div>
      <div class="text-right">
        <span class="block text-xs font-medium text-slate-500">Total en campo</span>
        <strong class="text-xl tracking-[-0.02em] text-slate-950">
          {{ formatCurrency(management.efectivo.total) }}
        </strong>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3">
      <CashAmountCell
        label="Con gerente"
        :amount="management.efectivo.conGerente"
        actionable
        @contact="contact('Efectivo con gerente', management.efectivo.conGerente)"
      />
      <CashAmountCell
        label="Con agencias"
        :amount="management.efectivo.conAgentes"
        actionable
        @contact="contact('Efectivo con agencias', management.efectivo.conAgentes)"
      />
    </div>

    <details v-if="management.agencias.length" class="group mt-4 border-t border-slate-200 pt-3">
      <summary class="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-lg px-2 text-sm font-semibold text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-700">
        Ver desglose de {{ management.agencias.length }} agencias
        <ChevronDown class="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>

      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div v-for="agency in management.agencias" :key="agency.agencia">
          <div class="mb-1.5 flex items-center justify-between gap-2 px-1 text-xs text-slate-600">
            <span class="font-semibold text-slate-800">{{ agency.agencia }}</span>
            <span>{{ agency.agente || (agency.estado === 'VACANTE' ? 'Agencia vacante' : 'Sin agente') }}</span>
          </div>
          <CashAmountCell
            :label="agency.cerrada ? 'Agencia cerrada' : 'Efectivo en campo'"
            :amount="agency.efectivoEnCampo"
            actionable
            @contact="contact(`Efectivo de ${agency.agencia}`, agency.efectivoEnCampo)"
          />
        </div>
      </div>
    </details>
    <p v-else class="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-500">
      Sin agencias con efectivo para esta semana.
    </p>
  </section>
</template>
