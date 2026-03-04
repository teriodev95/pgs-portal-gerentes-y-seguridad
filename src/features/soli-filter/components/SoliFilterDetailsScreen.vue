<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, CalendarDays, ExternalLink, FileCheck2, ScanText, ShieldCheck, X } from 'lucide-vue-next'
import { toCurrency } from '@/shared/utils'
import type { SoliFilterListDocumentDetail, SoliFilterListItem } from '../types/soliFilter.types'

import CardContainer from '@/shared/components/CardContainer.vue'
import DataField from '@/shared/components/DataField.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

const props = defineProps<{
  solicitud: SoliFilterListItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

const snapshot = computed(() => props.solicitud?.data?.tabla_cargos_snapshot)
const ocrTokens = computed(() => props.solicitud?.data?.ocr_tokens ?? [])

const documents = computed(() => {
  if (!props.solicitud?.documentos) return []

  return Object.entries(props.solicitud.documentos)
    .map(([key, value]) => ({
      key,
      label: formatDocLabel(key),
      detail: value,
    }))
    .filter((item): item is { key: string; label: string; detail: SoliFilterListDocumentDetail } => Boolean(item.detail))
})

function formatDocLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
}

function formatFieldLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
}

function formatFieldValue(value: string | null): string {
  if (value === null || value === undefined || value === 'null' || value === '') {
    return 'Sin dato'
  }

  return value
}

function formatDate(value?: string): string {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function openDocument(url: string): void {
  window.open(url, '_blank')
}
</script>

<template>
  <div
    v-if="solicitud"
    class="fixed inset-0 z-[80] bg-slate-100"
  >
    <div class="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm"
          @click="emit('close')"
        >
          <ArrowLeft class="h-5 w-5" />
        </button>

        <div class="min-w-0 flex-1">
          <p class="truncate text-lg font-semibold text-slate-800">Solicitud #{{ solicitud.id }}</p>
          <p class="truncate text-sm text-slate-500">R2 ID: {{ solicitud.data?.solicitud_id_r2 || 'Sin identificador' }}</p>
        </div>

        <span
          :class="[
            'rounded-full px-3 py-1 text-xs font-semibold capitalize',
            solicitud.status === 'pendiente'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-emerald-50 text-emerald-700',
          ]"
        >
          {{ solicitud.status }}
        </span>

        <button
          class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"
          @click="emit('close')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="h-[calc(100vh-81px)] overflow-y-auto">
      <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 pb-10">
        <AlertMsg
          type="info"
          label="Consulta validada."
          :message="`La API de Elysia regresó ${documents.length} documentos y ${ocrTokens.length} registros OCR para esta solicitud.`"
        />

        <CardContainer title="Resumen general">
          <div class="grid gap-3 md:grid-cols-2">
            <DataField label="Cliente" :value="solicitud.nombre_cliente" />
            <DataField label="Aval" :value="solicitud.nombre_aval" />
            <DataField label="Monto solicitado" :value="toCurrency(solicitud.monto_solicitado)" />
            <DataField label="Plazo" :value="`${solicitud.plazo_semanas} semanas`" />
            <DataField label="Nivel" :value="solicitud.nivel" />
            <DataField label="Tipo crédito" :value="solicitud.tipo_credito" />
            <DataField label="Agencia" :value="solicitud.agencia" />
            <DataField label="Gerencia" :value="solicitud.gerencia" />
            <DataField label="Semana / Año" :value="`${solicitud.semana} / ${solicitud.anio}`" />
            <DataField label="Creado por" :value="solicitud.created_by" />
          </div>
        </CardContainer>

        <CardContainer title="Snapshot financiero">
          <div v-if="snapshot" class="grid gap-3 md:grid-cols-2">
            <DataField label="Monto" :value="toCurrency(snapshot.monto_solicitado)" />
            <DataField label="Cargo" :value="toCurrency(snapshot.cargo)" />
            <DataField label="Total a pagar" :value="toCurrency(snapshot.total_pagar)" />
            <DataField label="Tarifa semanal" :value="toCurrency(snapshot.tarifa_semanal)" />
            <DataField label="Primer pago" :value="toCurrency(snapshot.primer_pago)" />
            <DataField label="Plazo" :value="`${snapshot.plazo_semanas} semanas`" />
            <DataField label="Nivel" :value="snapshot.nivel" />
          </div>
          <p v-else class="text-sm text-slate-500">No hay snapshot financiero disponible.</p>
        </CardContainer>

        <CardContainer title="Metadatos">
          <div class="grid gap-3 md:grid-cols-2">
            <DataField label="Persona cliente" :value="solicitud.persona_id_cliente || 'Sin ID'" />
            <DataField label="Persona aval" :value="solicitud.persona_id_aval || 'Sin ID'" />
            <DataField label="Creado" :value="formatDate(solicitud.created_at)" />
            <DataField label="Actualizado" :value="formatDate(solicitud.updated_at)" />
            <DataField label="Tabla cargos ID" :value="solicitud.tabla_cargos_id" />
            <DataField label="Solicitud R2" :value="solicitud.data?.solicitud_id_r2 || 'Sin ID'" />
          </div>
        </CardContainer>

        <CardContainer title="OCR tokens">
          <div v-if="ocrTokens.length" class="space-y-3">
            <div
              v-for="token in ocrTokens"
              :key="`${solicitud.id}-${token.doc}`"
              class="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div class="mb-2 flex items-center gap-2">
                <ScanText class="h-4 w-4 text-slate-600" />
                <p class="font-medium text-slate-700">{{ formatDocLabel(token.doc) }}</p>
              </div>
              <div class="grid gap-2 md:grid-cols-3">
                <DataField label="Input" :value="token.input" />
                <DataField label="Output" :value="token.output" />
                <DataField label="Total" :value="token.input + token.output" />
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-slate-500">No se reportaron tokens OCR.</p>
        </CardContainer>

        <CardContainer title="Documentos">
          <div class="space-y-4">
            <div
              v-for="{ key, label, detail } in documents"
              :key="`${solicitud.id}-${key}`"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div class="mb-3 flex items-center gap-2">
                <ShieldCheck class="h-4 w-4" :class="detail.valida ? 'text-emerald-600' : 'text-red-600'" />
                <h3 class="font-semibold text-slate-800">{{ label }}</h3>
                <span
                  :class="[
                    'ml-auto rounded-full px-2.5 py-1 text-xs font-semibold',
                    detail.valida ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
                  ]"
                >
                  {{ detail.valida ? 'Válido' : 'Revisión requerida' }}
                </span>
              </div>

              <div class="grid gap-3 md:grid-cols-2">
                <DataField label="Causa" :value="detail.causa || 'Sin incidencia'" />
                <DataField label="Solución" :value="detail.solucion || 'No requerida'" />
              </div>

              <div v-if="detail.datos_extraidos" class="mt-3 grid gap-3 md:grid-cols-2">
                <DataField
                  v-for="(value, fieldKey) in detail.datos_extraidos"
                  :key="`${key}-${fieldKey}`"
                  :label="formatFieldLabel(fieldKey)"
                  :value="formatFieldValue(value)"
                />
              </div>

              <div v-if="detail.url" class="mt-4 space-y-3">
                <img
                  :src="detail.url"
                  :alt="label"
                  class="h-48 w-full rounded-xl object-cover"
                />
                <BtnComponent variant="secondary" outline full-width @click="openDocument(detail.url)">
                  <template #icon-left>
                    <ExternalLink class="h-4 w-4" />
                  </template>
                  Abrir documento
                </BtnComponent>
              </div>
            </div>
          </div>
        </CardContainer>

        <div class="flex items-center justify-center gap-2 pt-1 text-xs text-slate-400">
          <CalendarDays class="h-4 w-4" />
          <span>Última actualización: {{ formatDate(solicitud.updated_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
