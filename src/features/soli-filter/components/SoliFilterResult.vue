<script setup lang="ts">
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-vue-next'
import { toCurrency } from '@/shared/utils'
import type { SoliFilterResponse } from '../types/soliFilter.types'
import DocumentRetryCard from './DocumentRetryCard.vue'

defineProps<{
  response: SoliFilterResponse
}>()

defineEmits<{
  'retry:photo': [campo: string]
  'retry:all': []
}>()
</script>

<template>
  <div class="space-y-4">
    <!-- SOLICITUD_COMPLETA -->
    <template v-if="response.code === 'SOLICITUD_COMPLETA'">
      <div class="flex flex-col items-center px-4 py-6">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
          <CheckCircle2 :size="32" :stroke-width="1.8" class="text-emerald-500" />
        </div>
        <h3 class="mt-4 text-lg font-semibold text-slate-800">Solicitud enviada</h3>
        <p class="mt-1 text-sm text-slate-400 text-center">
          Todos los documentos se leyeron correctamente.
        </p>
      </div>

      <!-- Info del crédito -->
      <div v-if="response.data.credito" class="rounded-xl border border-slate-100 bg-white p-3.5 mx-1 space-y-2">
        <p class="text-xs font-semibold text-slate-700 mb-2">Resumen del crédito</p>
        <div class="flex justify-between text-xs">
          <span class="text-slate-400">Cliente</span>
          <span class="font-medium text-slate-700">{{ response.data.nombre_cliente }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-slate-400">Aval</span>
          <span class="font-medium text-slate-700">{{ response.data.nombre_aval }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-slate-400">Monto</span>
          <span class="font-medium text-slate-700">{{ toCurrency(response.data.credito.monto_solicitado) }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-slate-400">Plazo</span>
          <span class="font-medium text-slate-700">{{ response.data.credito.plazo_semanas }} semanas</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-slate-400">Tarifa semanal</span>
          <span class="font-medium text-slate-700">{{ toCurrency(response.data.credito.tarifa_semanal) }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-slate-400">Total a pagar</span>
          <span class="font-semibold text-blue-700">{{ toCurrency(response.data.credito.total_pagar) }}</span>
        </div>
      </div>

      <!-- Datos extraídos por documento -->
      <div
        v-if="response.data.documentos?.detalle"
        class="space-y-2.5 px-1"
      >
        <div
          v-for="doc in response.data.documentos.detalle"
          :key="doc.documento"
          class="rounded-xl border border-slate-100 bg-white p-3.5"
        >
          <div class="flex items-center gap-2 mb-2">
            <CheckCircle2 v-if="doc.valida" :size="14" :stroke-width="2.5" class="text-emerald-500" />
            <AlertTriangle v-else :size="14" :stroke-width="2.5" class="text-amber-500" />
            <p class="text-xs font-semibold text-slate-700">{{ doc.documento }}</p>
          </div>
          <div
            v-if="doc.datos"
            class="space-y-1 pl-5"
          >
            <p
              v-for="(valor, clave) in doc.datos"
              :key="String(clave)"
              class="text-[11px] text-slate-500"
            >
              <span class="font-medium text-slate-600">{{ clave }}:</span> {{ valor }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- SOLICITUD_PARCIAL -->
    <template v-else-if="response.code === 'SOLICITUD_PARCIAL'">
      <div class="flex flex-col items-center px-4 py-6">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
          <AlertTriangle :size="32" :stroke-width="1.8" class="text-amber-500" />
        </div>
        <h3 class="mt-4 text-lg font-semibold text-slate-800">Solicitud parcial</h3>
        <p class="mt-1 text-sm text-slate-400 text-center">
          {{ response.message }}
        </p>
        <div class="mt-2 flex gap-2">
          <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
            {{ response.data.documentos?.leidos }} leídos
          </span>
          <span class="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
            {{ response.data.documentos?.no_leidos }} por repetir
          </span>
        </div>
      </div>

      <!-- Documentos a repetir -->
      <div
        v-if="response.data.documentos_a_repetir?.length"
        class="space-y-2.5 px-1"
      >
        <DocumentRetryCard
          v-for="doc in response.data.documentos_a_repetir"
          :key="doc.campo"
          :documento="doc"
          :show-retry-button="true"
          @retry="$emit('retry:photo', $event)"
        />
      </div>
    </template>

    <!-- DOCUMENTOS_INVALIDOS -->
    <template v-else-if="response.code === 'DOCUMENTOS_INVALIDOS'">
      <div class="flex flex-col items-center px-4 py-6">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <XCircle :size="32" :stroke-width="1.8" class="text-red-500" />
        </div>
        <h3 class="mt-4 text-lg font-semibold text-slate-800">Documentos inválidos</h3>
        <p class="mt-1 text-sm text-slate-400 text-center">
          {{ response.message }}
        </p>
      </div>

      <!-- Documentos con error -->
      <div
        v-if="response.data.documentos_a_repetir?.length"
        class="space-y-2.5 px-1"
      >
        <DocumentRetryCard
          v-for="doc in response.data.documentos_a_repetir"
          :key="doc.campo"
          :documento="doc"
        />
      </div>

      <!-- Retry button -->
      <div class="px-1">
        <button
          type="button"
          class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
          @click="$emit('retry:all')"
        >
          Intentar de nuevo
        </button>
      </div>
    </template>

    <!-- TABLA_CARGOS_NO_ENCONTRADA -->
    <template v-else-if="response.code === 'TABLA_CARGOS_NO_ENCONTRADA'">
      <div class="flex flex-col items-center px-4 py-6">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <XCircle :size="32" :stroke-width="1.8" class="text-red-500" />
        </div>
        <h3 class="mt-4 text-lg font-semibold text-slate-800">Plan no encontrado</h3>
        <p class="mt-1 text-sm text-slate-400 text-center">
          {{ response.message }}
        </p>
      </div>
      <div class="px-1">
        <button
          type="button"
          class="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
          @click="$emit('retry:all')"
        >
          Intentar de nuevo
        </button>
      </div>
    </template>
  </div>
</template>
