<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown, PhoneCall, Smartphone } from 'lucide-vue-next'
import { formatPhone } from '@/shared/utils/phone'
import AgencyCashRow from './AgencyCashRow.vue'
import type { CashContactContext, ManagementCash } from '../cash-report.types'
import { formatCurrency, getCashLevel } from '../cash-report.utils'

const props = defineProps<{ management: ManagementCash }>()
const emit = defineEmits<{ contact: [context: CashContactContext] }>()

const isGerenteRed = computed(() => getCashLevel(props.management.efectivo.conGerente) === 'red')
const isAgentesRed = computed(() => getCashLevel(props.management.efectivo.conAgentes) === 'red')

/**
 * El total también se semaforiza. Repartido, un mismo bulto pasa por debajo del
 * umbral en cada parte —$27.6k con el gerente y $11.7k en cinco agencias no
 * encienden nada— mientras la gerencia trae casi $40k en campo. Ese es justo el
 * caso que el reporte busca, y era el único que no avisaba.
 */
const isTotalRed = computed(() => getCashLevel(props.management.efectivo.total) === 'red')

/**
 * El aviso de la gerencia es uno solo y vive siempre en el mismo renglón. Antes
 * el botón se colgaba de la cifra que estuviera en rojo, así que cambiaba de
 * sitio entre una tarjeta y otra —en las métricas si era el gerente, en la
 * cabecera si era el total— y había que buscarlo. Las tres marcan al mismo
 * teléfono: tres botones no son tres avisos.
 *
 * Se nombra la primera en rojo, de la más concreta a la más general, para que
 * el aviso diga qué revisar. Si hay más de una, las cifras siguen en rojo
 * arriba y ahí se lee el resto.
 */
const cardAlert = computed(() => {
  const { total, conGerente, conAgentes } = props.management.efectivo

  if (isGerenteRed.value) return { concepto: 'Efectivo con gerente', monto: conGerente }
  if (isAgentesRed.value) return { concepto: 'Efectivo con agencias', monto: conAgentes }
  if (isTotalRed.value) return { concepto: 'Efectivo total en campo', monto: total }
  return null
})

function contact(concept: string, amount: number) {
  const { total, conGerente, conAgentes } = props.management.efectivo

  emit('contact', {
    gerencia: props.management.gerencia,
    responsable: props.management.responsable,
    concepto: concept,
    monto: amount,
    desglose: { total, conGerente, conAgentes }
  })
}
</script>

<template>
  <section class="space-y-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h2 class="text-base font-bold leading-snug text-slate-900">{{ management.gerencia }}</h2>
        <p class="mt-0.5 truncate text-xs font-medium text-slate-600">
          {{ management.responsable.nombre || management.gerente || 'Sin responsable asignado' }}
        </p>
        <p class="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">
          <Smartphone class="size-3.5" aria-hidden="true" />
          {{ formatPhone(management.responsable.telefono) || 'Sin teléfono registrado' }}
        </p>
      </div>
      <div class="shrink-0 text-right">
        <span class="block text-[11px] font-medium text-slate-400">Total en campo</span>
        <strong
          class="text-lg font-bold tracking-tight sm:text-xl"
          :class="isTotalRed ? 'text-red-700' : 'text-slate-900'"
        >
          {{ formatCurrency(management.efectivo.total) }}
        </strong>
      </div>
    </div>

    <!-- Metrics Row (Flat, clean, no nested cards) -->
    <div class="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <div>
        <span class="block text-xs font-medium text-slate-500">Con gerente</span>
        <strong
          class="mt-1 block text-base font-bold tracking-tight"
          :class="isGerenteRed ? 'text-red-700' : 'text-slate-900'"
        >
          {{ formatCurrency(management.efectivo.conGerente) }}
        </strong>
      </div>

      <div class="border-l border-slate-200/80 pl-4">
        <span class="block text-xs font-medium text-slate-500">Con agencias</span>
        <strong
          class="mt-1 block text-base font-bold tracking-tight"
          :class="isAgentesRed ? 'text-red-700' : 'text-slate-900'"
        >
          {{ formatCurrency(management.efectivo.conAgentes) }}
        </strong>
      </div>
    </div>

    <!-- Aviso de la gerencia: siempre aquí, diga lo que diga la cifra que lo
         encendió. Colgado de cada número cambiaba de sitio entre tarjetas. -->
    <div
      v-if="cardAlert"
      class="flex items-center justify-between gap-3 rounded-xl border border-red-200/80 bg-red-50/60 px-3.5 py-2.5"
    >
      <p class="min-w-0 text-xs font-semibold text-red-800">
        {{ cardAlert.concepto }} · {{ formatCurrency(cardAlert.monto) }}
      </p>
      <button
        type="button"
        class="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1"
        :aria-label="`Contactar a ${management.gerencia} por ${cardAlert.concepto} (${formatCurrency(cardAlert.monto)})`"
        @click="contact(cardAlert.concepto, cardAlert.monto)"
      >
        <PhoneCall class="size-3" aria-hidden="true" />
        Contactar
      </button>
    </div>

    <!-- Agency Breakdown -->
    <details v-if="management.agencias.length" class="group border-t border-slate-100 pt-2.5">
      <summary
        class="flex min-h-9 cursor-pointer list-none items-center justify-between rounded-lg px-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <span>Desglose de {{ management.agencias.length }} agencias</span>
        <ChevronDown class="size-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
      </summary>

      <div class="mt-2.5 grid gap-2 sm:grid-cols-2">
        <AgencyCashRow
          v-for="agency in management.agencias"
          :key="agency.agencia"
          :agency="agency.agencia"
          :agent="agency.agente"
          :closed="agency.cerrada"
          :amount="agency.efectivoEnCampo"
          actionable
          @contact="contact(`Efectivo de ${agency.agencia}`, agency.efectivoEnCampo)"
        />
      </div>
    </details>
    <p v-else class="border-t border-slate-100 pt-2.5 text-xs text-slate-400">
      Sin agencias con efectivo para esta semana.
    </p>
  </section>
</template>
