<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, ExternalLink, ShieldCheck, X, FileText, Camera, Image, Loader2 } from 'lucide-vue-next'
import { toCurrency } from '@/shared/utils'
import type { SoliFilterListItem } from '../types/soliFilter.types'
import { useSoliFilterDetails } from '../composables/useSoliFilterDetails'

import CardContainer from '@/shared/components/CardContainer.vue'
import DataField from '@/shared/components/DataField.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

const props = defineProps<{
  solicitud: SoliFilterListItem | null
}>()

const emit = defineEmits<{
  close: []
  refresh: []
}>()

const { isUploading, uploadingDocKey, tablaCargosData, isLoadingTablaCargos, resubirDocumento, fetchTablaCargos } = useSoliFilterDetails()

// Auto-fetch tabla_cargos when tabla_cargos_id_sugerido exists
watch(
  () => props.solicitud?.revision?.tabla_cargos_id_sugerido,
  (tablaCargosId) => {
    if (tablaCargosId) {
      fetchTablaCargos(tablaCargosId)
    }
  },
  { immediate: true }
)

const fileInputRefs = ref<Record<string, HTMLInputElement | null>>({})
const showOptionsForDoc = ref<string | null>(null)
const uploadError = ref<{ doc: string; causa: string; solucion: string } | null>(null)

const documents = computed(() => {
  if (!props.solicitud?.docs_resumen) return []
  return props.solicitud.docs_resumen
})

const validDocumentsCount = computed(() => {
  return documents.value.filter(doc => doc.valida).length
})

const revisionStatusConfig = computed(() => {
  const status = props.solicitud?.revision?.status
  switch (status) {
    case 'aprobada':
      return { label: 'Aprobada', class: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 }
    case 'rechazada':
      return { label: 'Rechazada', class: 'bg-red-50 text-red-700', icon: X }
    case 'corregir':
      return { label: 'Requiere corrección', class: 'bg-amber-50 text-amber-700', icon: AlertTriangle }
    default:
      return { label: 'Pendiente', class: 'bg-slate-50 text-slate-700', icon: Clock }
  }
})

function formatDocLabel(key: string): string {
  const labels: Record<string, string> = {
    ine_cliente: 'INE Cliente',
    comprobante_cliente: 'Comprobante Cliente',
    ine_aval: 'INE Aval',
    comprobante_aval: 'Comprobante Aval',
  }
  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())
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

function toggleOptions(docKey: string): void {
  showOptionsForDoc.value = showOptionsForDoc.value === docKey ? null : docKey
  // Clear error when user tries again
  if (uploadError.value?.doc === docKey) {
    uploadError.value = null
  }
}

function selectCamera(docKey: string): void {
  showOptionsForDoc.value = null
  const input = fileInputRefs.value[docKey]
  if (input) {
    input.setAttribute('capture', 'environment')
    input.click()
  }
}

function selectGallery(docKey: string): void {
  showOptionsForDoc.value = null
  const input = fileInputRefs.value[docKey]
  if (input) {
    input.removeAttribute('capture')
    input.click()
  }
}

async function handleFileChange(event: Event, docKey: string): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file || !props.solicitud) {
    input.value = ''
    return
  }

  // Clear previous errors
  uploadError.value = null

  const result = await resubirDocumento(props.solicitud.id, docKey, file)

  if (result.success) {
    emit('refresh')
  } else if (result.error) {
    uploadError.value = result.error
  }

  input.value = ''
}

function setFileInputRef(docKey: string, el: HTMLInputElement | null): void {
  if (el) {
    fileInputRefs.value[docKey] = el
  }
}
</script>

<template>
  <div v-if="solicitud" class="fixed inset-0 z-[80] bg-slate-100">
    <div class="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
        <button class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm"
          @click="emit('close')">
          <ArrowLeft class="h-5 w-5" />
        </button>

        <div class="min-w-0 flex-1">
          <p class="truncate text-lg font-semibold text-slate-800">Solicitud #{{ solicitud.id }}</p>
          <p class="truncate text-sm text-slate-500">{{ solicitud.nombre_cliente }}</p>
        </div>

        <component :is="revisionStatusConfig.icon" class="h-5 w-5" :class="revisionStatusConfig.class.includes('emerald') ? 'text-emerald-600' :
          revisionStatusConfig.class.includes('red') ? 'text-red-600' :
            revisionStatusConfig.class.includes('amber') ? 'text-amber-600' : 'text-slate-600'" />
        <span :class="['rounded-full px-3 py-1 text-xs font-semibold capitalize', revisionStatusConfig.class]">
          {{ revisionStatusConfig.label }}
        </span>

        <button
          class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500"
          @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="h-[calc(100vh-81px)] overflow-y-auto">
      <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 pb-10">
        <AlertMsg type="info" label="Solicitud cargada"
          :message="`${validDocumentsCount} de ${documents.length} documentos válidos • Revisión: ${revisionStatusConfig.label}`" />

        <CardContainer title="Estado de revisión">
          <div class="mb-4 flex items-center gap-3">
            <component :is="revisionStatusConfig.icon" class="h-6 w-6" />
            <div class="flex-1">
              <p class="font-semibold text-slate-800">{{ revisionStatusConfig.label }}</p>
              <p v-if="solicitud.revision.reviewed_by" class="text-sm text-slate-500">
                Revisado por {{ solicitud.revision.reviewed_by }} • {{ formatDate(solicitud.revision.reviewed_at ||
                  undefined)
                }}
              </p>
              <p v-else class="text-sm text-slate-500">Sin revisar</p>
            </div>
          </div>

          <div v-if="solicitud.revision.motivo_rechazo || solicitud.revision.diagnostico" class="space-y-3">
            <DataField v-if="solicitud.revision.motivo_rechazo" label="Motivo de rechazo" orientation="vertical"
              :value="solicitud.revision.motivo_rechazo" />
            <DataField v-if="solicitud.revision.diagnostico" label="Diagnóstico" orientation="vertical"
              :value="solicitud.revision.diagnostico" />
          </div>
        </CardContainer>

        <CardContainer title="Documentos">
          <div class="mb-4 flex items-center gap-2 text-sm text-slate-600">
            <FileText class="h-4 w-4" />
            <span>{{ validDocumentsCount }} de {{ documents.length }} documentos válidos</span>
            <span v-if="solicitud.doc_invalido_detalle" class="ml-auto text-red-600">
              Documento inválido: {{ formatDocLabel(solicitud.doc_invalido_detalle) }}
            </span>
          </div>

          <div class="space-y-4">
            <div v-for="doc in documents" :key="`${solicitud.id}-${doc.doc}`"
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="mb-3 flex items-center gap-2">
                <ShieldCheck class="h-4 w-4" :class="doc.valida ? 'text-emerald-600' : 'text-red-600'" />
                <h3 class="font-semibold text-slate-800">{{ formatDocLabel(doc.doc) }}</h3>
                <span :class="[
                  'ml-auto rounded-full px-2.5 py-1 text-xs font-semibold',
                  doc.valida ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
                ]">
                  {{ doc.valida ? 'Válido' : 'Revisión requerida' }}
                </span>
              </div>

              <div v-if="doc.causa || doc.solucion" class="grid gap-3 md:grid-cols-2 mb-4">
                <DataField v-if="doc.causa" label="Causa" :value="doc.causa" />
                <DataField v-if="doc.solucion" label="Solución" :value="doc.solucion" />
              </div>

              <div v-if="doc.url" class="space-y-2">
                <img :src="doc.url" :alt="formatDocLabel(doc.doc)" class="h-48 w-full rounded-xl object-cover" />

                <BtnComponent variant="secondary" outline full-width @click="openDocument(doc.url)">
                  <template #icon-left>
                    <ExternalLink class="h-4 w-4" />
                  </template>
                  Abrir documento
                </BtnComponent>
              </div>

              <!-- Re-upload section for invalid documents -->
              <div v-if="!doc.valida" class="space-y-2">
                <div v-if="showOptionsForDoc === doc.doc" class="grid grid-cols-2 gap-2">
                  <BtnComponent variant="secondary" outline full-width @click="selectCamera(doc.doc)">
                    <template #icon-left>
                      <Camera class="h-4 w-4" />
                    </template>
                    Tomar foto
                  </BtnComponent>
                  <BtnComponent variant="secondary" outline full-width @click="selectGallery(doc.doc)">
                    <template #icon-left>
                      <Image class="h-4 w-4" />
                    </template>
                    Galería
                  </BtnComponent>
                </div>
                <BtnComponent v-else variant="primary" full-width :disabled="isUploading && uploadingDocKey === doc.doc"
                  @click="toggleOptions(doc.doc)">
                  <template v-if="isUploading && uploadingDocKey === doc.doc" #icon-left>
                    <Loader2 class="h-4 w-4 animate-spin" />
                  </template>
                  {{ isUploading && uploadingDocKey === doc.doc ? 'Subiendo...' : 'Corregir documento' }}
                </BtnComponent>

                <!-- Error message from upload -->
                <div v-if="uploadError && uploadError.doc === doc.doc"
                  class="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
                  <p class="text-xs font-semibold text-red-800">{{ uploadError.causa }}</p>
                  <p class="text-xs text-red-600">{{ uploadError.solucion }}</p>
                </div>

                <!-- Hidden file input -->
                <input :ref="(el) => setFileInputRef(doc.doc, el as HTMLInputElement)" type="file" accept="image/*"
                  class="hidden" @change="handleFileChange($event, doc.doc)" />
              </div>
            </div>
          </div>
        </CardContainer>

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

        <CardContainer title="Información de identificación">
          <div class="grid gap-3 md:grid-cols-2">
            <DataField label="Persona ID cliente" :value="solicitud.persona_id_cliente || 'Sin ID'" />
            <DataField label="Persona ID aval" :value="solicitud.persona_id_aval || 'Sin ID'" />
            <DataField label="No. servicio cliente" :value="solicitud.no_servicio_cliente || 'Sin dato'" />
            <DataField label="No. servicio aval" :value="solicitud.no_servicio_aval || 'Sin dato'" />
            <DataField label="CURP cliente" :value="solicitud.curp_cliente || 'Sin dato'" />
            <DataField label="CURP aval" :value="solicitud.curp_aval || 'Sin dato'" />
          </div>
        </CardContainer>

        <CardContainer v-if="solicitud.tipo_credito === 'renovacion'" title="Información de renovación">
          <div class="grid gap-3 md:grid-cols-2">
            <DataField label="Préstamo anterior ID" :value="solicitud.prestamo_anterior_id || 'Sin dato'" />
            <DataField label="Monto anterior"
              :value="solicitud.monto_anterior ? toCurrency(solicitud.monto_anterior) : 'Sin dato'" />
            <DataField label="Nivel anterior" :value="solicitud.nivel_anterior || 'Sin dato'" />
            <DataField label="Liquidado con descuento"
              :value="solicitud.liquidado_con_descuento === null ? 'Sin dato' : solicitud.liquidado_con_descuento ? 'Sí' : 'No'" />
          </div>
        </CardContainer>

        <CardContainer v-if="solicitud.revision.tabla_cargos_id_sugerido" title="Tabla de cargos sugerida">
          <div v-if="isLoadingTablaCargos" class="py-4 text-center text-sm text-slate-500">
            Cargando información de tabla de cargos...
          </div>
          <div v-else-if="tablaCargosData" class="grid gap-3 md:grid-cols-2">
            <DataField label="ID" :value="String(tablaCargosData.id)" />
            <DataField label="Nivel" :value="tablaCargosData.nivel" />
            <DataField label="Monto solicitado" :value="toCurrency(tablaCargosData.monto_solicitado)" />
            <DataField label="Plazo" :value="`${tablaCargosData.plazo_semanas} semanas`" />
            <DataField label="Cargo" :value="`$${tablaCargosData.cargo}`" />
            <DataField label="Total a pagar" :value="`$${tablaCargosData.total_pagar}`" />
            <DataField label="Tarifa semanal" :value="`$${tablaCargosData.tarifa_semanal}`" />
            <DataField label="Primer pago" :value="`$${tablaCargosData.primer_pago}`" />
            <DataField label="Cargo %" :value="`${tablaCargosData.cargo_total_porcentaje}%`" />
            <DataField label="Identificador" :value="tablaCargosData.identificador" />
          </div>
          <div v-else class="py-4 text-center text-sm text-slate-500">
            {{ tablaCargosData }}
            No se pudo cargar la información de tabla de cargos
          </div>
        </CardContainer>


        <CardContainer title="Metadatos">
          <div class="grid gap-3 md:grid-cols-2">
            <DataField label="Tabla cargos ID" :value="String(solicitud.tabla_cargos_id)" />
            <DataField label="Documentos válidos" :value="`${solicitud.docs_validos} de ${documents.length}`" />
            <DataField label="Creado" :value="formatDate(solicitud.created_at)" />
            <DataField label="Actualizado" :value="formatDate(solicitud.updated_at)" />
          </div>
        </CardContainer>
      </div>
    </div>
  </div>
</template>
