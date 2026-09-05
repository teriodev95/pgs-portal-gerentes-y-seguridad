<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check } from 'lucide-vue-next'
import type { Cadena, Tramo } from '../types/cashFlow.types'
import { useCashFlowFormatters } from '../composables/useCashFlowFormatters'

const props = defineProps<{ cadenas: Cadena[] }>()
const { formatMoney } = useCashFlowFormatters()

type Filtro = 'todas' | 'con_efectivo'
const filtro = ref<Filtro>('todas')

// Una cadena sin cobranza ni entregas (p. ej. "SIN AGENCIA") no dice nada.
const conMovimiento = computed(() =>
  props.cadenas.filter((c) => c.cobranza > 0 || c.entregado > 0 || c.en_campo > 0),
)

// Primero las que aún tienen efectivo en campo, de mayor a menor.
const visibles = computed(() => {
  const base = filtro.value === 'todas' ? conMovimiento.value : conMovimiento.value.filter((c) => c.en_campo > 0)
  return [...base].sort((a, b) => b.en_campo - a.en_campo)
})

const totalEnCampo = computed(() => conMovimiento.value.reduce((t, c) => t + c.en_campo, 0))
const conEfectivo = computed(() => conMovimiento.value.filter((c) => c.en_campo > 0).length)

/** Porcentaje de la cobranza que ya se entregó, para la barra. */
function avanceDe(c: Cadena): number {
  if (c.cobranza <= 0) return c.entregado > 0 ? 100 : 0
  return Math.min(100, Math.round((c.entregado / c.cobranza) * 100))
}

/** Entregas de esta agencia que siguen en custodia (Seguridad/Regional) sin regresar. */
function custodiasDe(c: Cadena): Tramo[] {
  return c.tramos.filter((t) => t.abierto && t.a.rol === 'Custodio')
}

function totalCustodia(c: Cadena): number {
  return custodiasDe(c).reduce((total, t) => total + t.monto, 0)
}

/** "02/09 11:02" a partir del ISO local que manda Elysia. */
function horaCorta(iso: string): string {
  const [fecha, hora] = iso.split('T')
  if (!fecha || !hora) return iso
  const [, mes, dia] = fecha.split('-')
  return `${dia}/${mes} ${hora.slice(0, 5)}`
}
</script>

<template>
  <section class="rounded-xl border border-gray-200 bg-white">
    <div class="flex items-center justify-between px-4 pt-4">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Agencias</p>
        <p class="text-xs text-gray-600">
          En campo <b :class="totalEnCampo > 0 ? 'text-rose-700' : 'text-gray-900'">{{ formatMoney(totalEnCampo) }}</b>
        </p>
      </div>
      <div class="flex gap-1">
        <button
          type="button"
          class="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
          :class="filtro === 'todas' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-600'"
          @click="filtro = 'todas'"
        >
          Todas {{ conMovimiento.length }}
        </button>
        <button
          type="button"
          class="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
          :class="filtro === 'con_efectivo' ? 'border-rose-600 bg-rose-600 text-white' : 'border-gray-200 text-gray-600'"
          @click="filtro = 'con_efectivo'"
        >
          Con efectivo {{ conEfectivo }}
        </button>
      </div>
    </div>

    <p v-if="visibles.length === 0" class="p-4 text-center text-xs text-gray-500">
      Ninguna agencia con efectivo en campo.
    </p>

    <ul v-else class="mt-2 divide-y divide-gray-100">
      <li v-for="c in visibles" :key="c.agencia" class="px-4 py-3">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-gray-950">
              {{ c.agencia }}
              <span v-if="c.vacante" class="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">VACANTE</span>
              <span v-else-if="c.agente" class="ml-1 font-normal text-gray-600">{{ c.agente }}</span>
            </p>
            <p class="mt-0.5 text-xs text-gray-500">
              Cobranza <span class="font-semibold text-gray-800">{{ formatMoney(c.cobranza) }}</span>
              · Entregado <span class="font-semibold text-gray-800">{{ formatMoney(c.entregado) }}</span>
            </p>
          </div>

          <div class="shrink-0 text-right">
            <!-- Una agencia cerrada puede traer pagos capturados despues del cierre:
                 se ve Cerrada y, si hay, su En campo. -->
            <span
              v-if="c.cerrada"
              class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700"
            >
              <Check class="size-3" :stroke-width="2.5" /> Cerrada
            </span>
            <template v-if="!c.cerrada || c.en_campo > 0">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-500">En campo</p>
              <p class="text-base font-bold" :class="c.en_campo > 0 ? 'text-rose-700' : 'text-gray-900'">
                {{ formatMoney(c.en_campo) }}
              </p>
            </template>
            <template v-if="custodiasDe(c).length">
              <p class="text-[11px] font-semibold text-amber-700">Custodia {{ formatMoney(totalCustodia(c)) }}</p>
              <p v-for="t in custodiasDe(c)" :key="t.asignacion_id" class="text-[10px] text-amber-700">
                {{ t.a.nombre }} · {{ horaCorta(t.hora) }}
              </p>
            </template>
          </div>
        </div>

        <div class="mt-2 h-1.5 w-full overflow-hidden rounded bg-gray-100">
          <div class="h-full rounded" :class="c.cerrada ? 'bg-emerald-500' : 'bg-blue-500'" :style="{ width: `${avanceDe(c)}%` }" />
        </div>
      </li>
    </ul>
  </section>
</template>
