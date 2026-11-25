<script setup lang="ts">
import { computed, ref } from 'vue'
import { toCurrency } from '@/shared/utils'
import type { CreditoSinRegistro } from '../types'

// El cierre no se firma con clientes sin registro en la semana. Aquí el gerente ve quiénes
// son, qué puede hacer y qué pasa si los registra como no pago.
const props = defineProps<{
  creditos: CreditoSinRegistro[]
  semana: number
  registrando: boolean
  registrados: number
}>()

const emit = defineEmits<{ (e: 'registrar'): void }>()

// Un no pago marca al cliente: se pide confirmar antes de registrar a todos.
const confirmando = ref(false)

const cuantos = computed(() =>
  props.creditos.length === 1 ? '1 cliente' : `${props.creditos.length} clientes`
)

const registrar = () => {
  confirmando.value = false
  emit('registrar')
}
</script>

<template>
  <section class="rounded-lg border border-amber-300 bg-white" aria-labelledby="sin-registro-titulo">
    <header class="space-y-1 border-b border-amber-200 bg-amber-50 p-4">
      <h2 id="sin-registro-titulo" class="text-base font-bold leading-5 text-slate-900">
        No puedes firmar todavía: {{ cuantos }} sin registro en la semana {{ semana }}
      </h2>
      <p class="text-sm text-slate-700">
        No tienen pago ni no pago capturado. Si alguno sí pagó, captura su pago en Pagos. A los que
        no pagaron, regístralos aquí como no pago.
      </p>
    </header>

    <ul class="max-h-80 divide-y divide-slate-200 overflow-y-auto px-4">
      <li
        v-for="credito in creditos"
        :key="credito.prestamoId"
        class="flex items-start justify-between gap-3 py-2.5"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-slate-900">{{ credito.cliente }}</p>
          <p class="truncate text-xs text-slate-500">
            {{ credito.prestamoId }}<template v-if="credito.folio"> · Contrato {{ credito.folio }}</template>
          </p>
        </div>
        <div class="flex-none text-right">
          <p class="text-sm font-medium text-slate-900">{{ toCurrency(credito.tarifa) }}</p>
          <p class="text-xs text-slate-500">Tarifa</p>
        </div>
      </li>
    </ul>

    <footer class="space-y-3 border-t border-slate-200 p-4">
      <p v-if="registrando" class="text-center text-sm text-slate-700" role="status">
        Registrando no pagos: {{ registrados }} de {{ creditos.length }}…
      </p>

      <template v-else-if="confirmando">
        <p class="text-sm text-slate-900">
          ¿Confirmas que {{ creditos.length === 1 ? 'este cliente no pagó' : `estos ${cuantos} no pagaron` }}
          en la semana {{ semana }}? Se guardará un no pago de $0 a tu nombre por cada uno.
        </p>
        <div class="flex gap-2">
          <button type="button" class="btn-primary-outline flex-1" @click="confirmando = false">
            Cancelar
          </button>
          <button type="button" class="btn-primary flex-1" @click="registrar">
            Sí, registrar no pago
          </button>
        </div>
      </template>

      <template v-else>
        <button type="button" class="btn-primary w-full" @click="confirmando = true">
          Registrar {{ cuantos }} como no pago ($0)
        </button>
        <p class="text-center text-xs text-slate-500">
          Al terminar podrás continuar con la firma del cierre.
        </p>
      </template>
    </footer>
  </section>
</template>
