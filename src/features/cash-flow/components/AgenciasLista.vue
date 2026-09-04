<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check } from 'lucide-vue-next'
import type { Cadena } from '../types/cashFlow.types'
import { useCashFlowFormatters } from '../composables/useCashFlowFormatters'

const props = defineProps<{ cadenas: Cadena[] }>()
const { formatMoney } = useCashFlowFormatters()

type Filtro = 'todas' | 'con_efectivo'
const filtro = ref<Filtro>('todas')

const visibles = computed(() =>
  filtro.value === 'todas' ? props.cadenas : props.cadenas.filter((c) => c.en_campo > 0),
)

/** Lo que de esta agencia sigue en custodia (Seguridad/Regional) sin regresar. */
function custodiaDe(cadena: Cadena): number {
  return cadena.tramos
    .filter((t) => t.abierto && t.a.rol === 'Custodio')
    .reduce((total, t) => total + t.monto, 0)
}
</script>

<template>
  <section class="space-y-2">
    <div class="flex items-center justify-between px-1">
      <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Agencias</p>
      <div class="flex gap-1">
        <button
          v-for="f in ([['todas', 'Todas'], ['con_efectivo', 'Con efectivo']] as const)"
          :key="f[0]"
          type="button"
          class="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
          :class="filtro === f[0] ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-600'"
          @click="filtro = f[0]"
        >
          {{ f[1] }}
        </button>
      </div>
    </div>

    <p v-if="visibles.length === 0" class="rounded-xl border border-gray-200 bg-white p-4 text-center text-xs text-gray-500">
      Sin agencias con efectivo en campo.
    </p>

    <article
      v-for="c in visibles"
      :key="c.agencia"
      class="rounded-xl border border-gray-200 bg-white p-3"
    >
      <div class="flex items-center justify-between gap-2">
        <p class="truncate text-sm font-semibold text-gray-950">
          {{ c.agencia }}
          <span class="ml-1 font-normal" :class="c.vacante ? 'text-amber-700' : 'text-gray-600'">
            {{ c.vacante ? 'VACANTE' : c.agente }}
          </span>
        </p>
        <span
          v-if="c.cerrada"
          class="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
        >
          <Check class="size-3" :stroke-width="2.5" /> Cerrada
        </span>
      </div>

      <p class="mt-1.5 text-xs text-gray-600">
        Cobranza <b class="text-gray-900">{{ formatMoney(c.cobranza) }}</b>
        · Entregado <b class="text-gray-900">{{ formatMoney(c.entregado) }}</b>
      </p>
      <p class="mt-0.5 flex items-center justify-between text-xs text-gray-600">
        <span>En campo <b :class="c.en_campo > 0 ? 'text-rose-700' : 'text-gray-900'">{{ formatMoney(c.en_campo) }}</b></span>
        <span v-if="custodiaDe(c) > 0" class="text-amber-700">Custodia <b>{{ formatMoney(custodiaDe(c)) }}</b></span>
      </p>
    </article>
  </section>
</template>
