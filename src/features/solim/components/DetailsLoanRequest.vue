<script setup lang="ts">
import { computed } from 'vue'
import {
  AlertCircle,
  ShieldCheck
} from 'lucide-vue-next'
import CardContainer from '@/shared/components/CardContainer.vue'
import DocumentViewer from './DocumentViewer.vue'
import DetailSection from './DetailSection.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  ActivosData,
  ApprovalDecision,
  ApprovalType,
  RevisionApproval,
  Solicitud
} from '../types'
import { getFiltradoHeading, isNarrativeEmpty, NEUTRAL_CLOSE } from '../constants/filtradoCopy'

interface Props {
  request: Solicitud
  approvalType: ApprovalType
  roleLabel: string
  canRegisterDecision: boolean
  isLoadingAction?: boolean
}

interface Emits {
  (e: 'open:review', approvalType?: ApprovalType): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const approvals = computed<RevisionApproval[]>(
  () => props.request.revision_aprobaciones ?? props.request.revision?.aprobaciones ?? []
)

const currentApproval = computed(
  () => approvals.value.find((approval) => approval.tipo === props.approvalType) ?? null
)

const garantiasApproval = computed(
  () => approvals.value.find((a) => a.tipo === 'garantias') ?? null
)

const planSnapshot = computed(() => props.request.tabla_cargos_snapshot ?? props.request.revision?.tabla_cargos_snapshot ?? null)

const clientFullName = computed(() =>
  [props.request.cliente_nombres, props.request.cliente_ap_paterno, props.request.cliente_ap_materno]
    .filter(Boolean)
    .join(' ')
)

const guarantorFullName = computed(() =>
  [props.request.aval_nombres, props.request.aval_ap_paterno, props.request.aval_ap_materno]
    .filter(Boolean)
    .join(' ')
)

const clientDocuments = computed(() => {
  const images = props.request.documentos?.imagenes ?? []
  const findUrl = (tipo: string) => images.find((document) => document.tipo === tipo)?.url ?? ''

  return [
    { label: 'INE cliente frente', value: findUrl('ine_cliente_frente'), type: 'image' as const },
    { label: 'INE cliente reverso', value: findUrl('ine_cliente_reverso'), type: 'image' as const },
    {
      label: 'Comprobante cliente',
      value: findUrl('comprobante_domicilio_cliente'),
      type: 'image' as const
    },
    { label: 'No. servicio', value: props.request.cliente_no_servicio ?? '', type: 'text' as const }
  ]
})

const guarantorDocuments = computed(() => {
  const images = props.request.documentos?.imagenes ?? []
  const findUrl = (tipo: string) => images.find((document) => document.tipo === tipo)?.url ?? ''

  return [
    { label: 'INE aval frente', value: findUrl('ine_aval_frente'), type: 'image' as const },
    { label: 'INE aval reverso', value: findUrl('ine_aval_reverso'), type: 'image' as const },
    {
      label: 'Comprobante aval',
      value: findUrl('comprobante_domicilio_aval'),
      type: 'image' as const
    },
    { label: 'No. servicio', value: props.request.aval_no_servicio ?? '', type: 'text' as const }
  ]
})

const clientInfo = computed(() => [
  { label: 'Nombre completo', value: clientFullName.value || 'Sin capturar' },
  { label: 'CURP', value: props.request.cliente_curp || 'Sin capturar' },
  { label: 'RFC', value: props.request.cliente_rfc || 'Sin capturar' },
  { label: 'Fecha de nacimiento', value: props.request.cliente_fecha_nacimiento || 'Sin capturar' },
  { label: 'Género', value: props.request.cliente_genero || 'Sin capturar' },
  { label: 'Estado civil', value: props.request.cliente_estado_civil || 'Sin capturar' },
  { label: 'Teléfono', value: props.request.cliente_telefono || 'Sin capturar' },
  { label: 'Correo', value: props.request.cliente_email || 'Sin capturar' }
])

const clientAddress = computed(() => [
  {
    label: 'Dirección',
    value: [
      props.request.cliente_calle,
      props.request.cliente_no_exterior,
      props.request.cliente_no_interior
    ]
      .filter(Boolean)
      .join(' ') || 'Sin capturar'
  },
  { label: 'Colonia', value: props.request.cliente_colonia || 'Sin capturar' },
  { label: 'Municipio', value: props.request.cliente_municipio || 'Sin capturar' },
  { label: 'Estado', value: props.request.cliente_estado || 'Sin capturar' },
  { label: 'Código postal', value: props.request.cliente_cp || 'Sin capturar' },
  { label: 'No. servicio', value: props.request.cliente_no_servicio || 'Sin capturar' }
])

const clientFinance = computed(() => [
  { label: 'Ocupación', value: props.request.cliente_ocupacion || 'Sin capturar' },
  { label: 'Empresa', value: props.request.cliente_empresa || 'Sin capturar' },
  { label: 'Ingresos mensuales', value: formatMoney(props.request.cliente_ingresos_mensuales) },
  { label: 'Egresos mensuales', value: formatMoney(props.request.cliente_egresos_mensuales) }
])

const guarantorInfo = computed(() => [
  { label: 'Nombre completo', value: guarantorFullName.value || 'Sin capturar' },
  { label: 'CURP', value: props.request.aval_curp || 'Sin capturar' },
  { label: 'RFC', value: props.request.aval_rfc || 'Sin capturar' },
  { label: 'Fecha de nacimiento', value: props.request.aval_fecha_nacimiento || 'Sin capturar' },
  { label: 'Género', value: props.request.aval_genero || 'Sin capturar' },
  { label: 'Estado civil', value: props.request.aval_estado_civil || 'Sin capturar' },
  { label: 'Teléfono', value: props.request.aval_telefono || 'Sin capturar' },
  { label: 'Correo', value: props.request.aval_email || 'Sin capturar' }
])

const guarantorAddress = computed(() => [
  {
    label: 'Dirección',
    value: [
      props.request.aval_calle,
      props.request.aval_no_exterior,
      props.request.aval_no_interior
    ]
      .filter(Boolean)
      .join(' ') || 'Sin capturar'
  },
  { label: 'Colonia', value: props.request.aval_colonia || 'Sin capturar' },
  { label: 'Municipio', value: props.request.aval_municipio || 'Sin capturar' },
  { label: 'Estado', value: props.request.aval_estado || 'Sin capturar' },
  { label: 'Código postal', value: props.request.aval_cp || 'Sin capturar' },
  { label: 'No. servicio', value: props.request.aval_no_servicio || 'Sin capturar' }
])

const guarantorFinance = computed(() => [
  { label: 'Ocupación', value: props.request.aval_ocupacion || 'Sin capturar' },
  { label: 'Empresa', value: props.request.aval_empresa || 'Sin capturar' },
  { label: 'Ingresos mensuales', value: formatMoney(props.request.aval_ingresos_mensuales) },
  { label: 'Egresos mensuales', value: formatMoney(props.request.aval_egresos_mensuales) }
])

const creditInfo = computed(() => [
  { label: 'Monto solicitado', value: formatMoney(props.request.monto_solicitado) },
  { label: 'Plazo', value: props.request.plazo_semanas ? `${props.request.plazo_semanas} semanas` : 'Sin capturar' },
  { label: 'Tipo de crédito', value: props.request.tipo_credito || 'Sin definir' },
  { label: 'Nivel', value: planSnapshot.value?.nivel || props.request.nivel_cliente || 'Sin definir' },
  { label: 'Tabla de cargos', value: String(planSnapshot.value?.id ?? props.request.tabla_cargos_id ?? '-') },
  { label: 'Tarifa semanal', value: formatMoney(planSnapshot.value?.tarifa_semanal ?? props.request.tarifa_semanal) },
  { label: 'Primer pago', value: formatMoney(planSnapshot.value?.primer_pago ?? props.request.primer_pago) },
  { label: 'Cargo', value: formatMoney(planSnapshot.value?.cargo ?? props.request.cargo) },
  { label: 'Total a pagar', value: formatMoney(planSnapshot.value?.total_pagar ?? props.request.total_pagar) }
])

const referenceClientItems = computed(() => mapReferences('Referencia', props.request.cliente_referencias))
const referenceGuarantorItems = computed(() => mapReferences('Referencia', props.request.aval_referencias))
const clientAssetItems = computed(() => mapAssets(props.request.cliente_activos))
const guarantorAssetItems = computed(() => mapAssets(props.request.aval_activos))
const clientAssetPhotos = computed(() => mapAssetPhotos('Activo cliente', props.request.cliente_activos))
const guarantorAssetPhotos = computed(() => mapAssetPhotos('Activo aval', props.request.aval_activos))

const filtradoHeading = computed(() => getFiltradoHeading(props.request.status_revision))

const headingToneClasses: Record<ReturnType<typeof getFiltradoHeading>['tone'], string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-400'
}

const diagnosticoText = computed(() => {
  const raw = props.request.diagnostico
  if (isNarrativeEmpty(raw)) return null
  return raw as string
})

const motivoText = computed(() => {
  const raw = props.request.motivo_rechazo
  if (isNarrativeEmpty(raw)) return null
  return raw as string
})

const docDetalleText = computed(() => {
  const raw = props.request.doc_invalido_detalle
  if (isNarrativeEmpty(raw)) return null
  return raw as string
})

const showNeutralClose = computed(() => {
  const d = diagnosticoText.value
  if (!d) return true
  const normalized = d
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return !normalized.includes('quedan registrados para revision')
})

const hasLocation = computed(
  () =>
    typeof props.request.gps_lat === 'number' &&
    Number.isFinite(props.request.gps_lat) &&
    typeof props.request.gps_lng === 'number' &&
    Number.isFinite(props.request.gps_lng)
)

const openStreetMapEmbedUrl = computed(() => {
  if (!hasLocation.value) return ''
  const lat = props.request.gps_lat as number
  const lng = props.request.gps_lng as number
  const delta = 0.008
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`
})

const openStreetMapUrl = computed(() => {
  if (!hasLocation.value) return ''
  return `https://www.openstreetmap.org/?mlat=${props.request.gps_lat}&mlon=${props.request.gps_lng}#map=16/${props.request.gps_lat}/${props.request.gps_lng}`
})

const APPROVAL_TYPE_LABELS: Record<string, string> = {
  gerente: 'Gerente',
  oficina: 'Oficina',
  garantias: 'Garantías',
  seguridad: 'Seguridad',
  direccion: 'Dirección'
}

function approvalDotClass(decision?: ApprovalDecision): string {
  switch (decision) {
    case 'aprobado':
    case 'aprobado_con_ajuste':
      return 'bg-emerald-500'
    case 'rechazado':
      return 'bg-rose-500'
    case 'no_aplica':
      return 'bg-slate-300'
    default:
      return 'bg-amber-400'
  }
}

const isApprovalAlreadyDecided = computed(() => {
  const decision = currentApproval.value?.decision
  return decision === 'aprobado' || decision === 'aprobado_con_ajuste' || decision === 'rechazado'
})

const extraReviewType = computed<ApprovalType | null>(() => {
  if (props.approvalType !== 'seguridad') return null
  const g = garantiasApproval.value
  if (!g || g.requerido !== 1) return null
  const d = g.decision
  if (d === 'aprobado' || d === 'aprobado_con_ajuste' || d === 'rechazado') return null
  return 'garantias'
})

function formatMoney(value?: number | null) {
  return value != null
    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(value)
    : 'Sin capturar'
}

function formatApprovalDecision(decision?: ApprovalDecision) {
  switch (decision) {
    case 'aprobado':
      return 'Aprobado'
    case 'aprobado_con_ajuste':
      return 'Aprobado con ajuste'
    case 'rechazado':
      return 'Rechazado'
    case 'no_aplica':
      return 'No aplica'
    default:
      return 'Pendiente'
  }
}

function mapReferences(prefix: string, references?: Solicitud['cliente_referencias']) {
  if (!references?.length) {
    return [{ label: prefix, value: 'Sin referencias registradas' }]
  }

  return references.map((reference, index) => ({
    label: `${prefix} ${index + 1}`,
    value: [reference?.nombre, reference?.parentesco, reference?.telefono].filter(Boolean).join(' · ') || 'Sin capturar'
  }))
}

function mapAssets(assets?: ActivosData | null) {
  if (!assets) {
    return [{ label: 'Activos', value: 'Sin activos registrados' }]
  }

  return [
    { label: 'Tipo de vivienda', value: assets.vivienda_tipo || 'Sin capturar' },
    { label: 'Pisos', value: assets.vivienda_pisos || 'Sin capturar' },
    { label: 'Color', value: assets.vivienda_color || 'Sin capturar' },
    {
      label: 'Vehículo',
      value: assets.vehiculo?.tiene
        ? [assets.vehiculo.marca, assets.vehiculo.modelo, assets.vehiculo.color, assets.vehiculo.placas]
            .filter(Boolean)
            .join(' · ') || 'Registrado'
        : 'No registrado'
    },
    { label: 'Otros', value: assets.otros || 'Sin capturar' }
  ]
}

function mapAssetPhotos(prefix: string, assets?: ActivosData | null) {
  const photos = assets?.fotos_urls?.filter(Boolean) ?? []
  return photos.map((photo, index) => ({
    label: `${prefix} ${index + 1}`,
    value: photo,
    type: 'image' as const
  }))
}
</script>

<template>
  <div class="relative" :class="canRegisterDecision ? 'pb-28' : 'pb-4'">
  <Tabs default-value="revision" class="space-y-4">
    <TabsList class="grid h-auto w-full grid-cols-4 rounded-3xl bg-white p-2 shadow-sm">
      <TabsTrigger value="revision" class="rounded-2xl py-3 text-sm font-semibold">Revisión</TabsTrigger>
      <TabsTrigger value="cliente" class="rounded-2xl py-3 text-sm font-semibold">Cliente</TabsTrigger>
      <TabsTrigger value="aval" class="rounded-2xl py-3 text-sm font-semibold">Aval</TabsTrigger>
      <TabsTrigger value="credito" class="rounded-2xl py-3 text-sm font-semibold">Crédito</TabsTrigger>
    </TabsList>

    <TabsContent value="revision" class="space-y-4">
      <!-- Diagnóstico narrativo neutral -->
      <CardContainer class-name="rounded-3xl">
        <div class="space-y-5">
          <div class="flex items-start gap-3">
            <span
              class="mt-2 inline-block size-2.5 shrink-0 rounded-full"
              :class="headingToneClasses[filtradoHeading.tone]"
              aria-hidden="true"
            />
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <ShieldCheck class="size-5 text-slate-500" />
                {{ filtradoHeading.title }}
              </p>
              <p class="mt-1 text-sm text-slate-500">{{ filtradoHeading.subtitle }}</p>
            </div>
          </div>

          <div class="space-y-4 border-t border-slate-200 pt-4">
            <p
              v-if="diagnosticoText"
              class="text-base leading-relaxed text-slate-700"
            >
              {{ diagnosticoText }}
            </p>
            <p
              v-else
              class="text-sm italic leading-relaxed text-slate-500"
            >
              Todavía no hay diagnóstico registrado para este expediente.
            </p>

            <div
              v-if="motivoText"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Motivo</p>
              <p class="mt-1.5 text-sm leading-relaxed text-slate-700">{{ motivoText }}</p>
            </div>

            <div
              v-if="docDetalleText"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Detalle documental</p>
              <p class="mt-1.5 text-sm leading-relaxed text-slate-700">{{ docDetalleText }}</p>
            </div>

            <p
              v-if="showNeutralClose"
              class="text-xs leading-relaxed text-slate-500"
            >
              {{ NEUTRAL_CLOSE }}
            </p>
          </div>
        </div>
      </CardContainer>

      <!-- Aprobaciones — único lugar donde viven los roles requeridos + su estado -->
      <CardContainer v-if="approvals.length" class-name="rounded-3xl">
        <div class="space-y-4">
          <p class="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <AlertCircle class="size-5 text-slate-500" />
            Estado de las aprobaciones
          </p>
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="approval in approvals"
              :key="approval.tipo"
              class="flex min-h-[140px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="inline-block size-2.5 shrink-0 rounded-full"
                    :class="approvalDotClass(approval.decision)"
                    aria-hidden="true"
                  />
                  <p class="truncate text-sm font-semibold text-slate-900">
                    {{ APPROVAL_TYPE_LABELS[approval.tipo] || approval.tipo }}
                  </p>
                </div>
                <span
                  v-if="approval.requerido"
                  class="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
                >
                  Requerido
                </span>
                <span
                  v-else
                  class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  No aplica
                </span>
              </div>

              <div class="mt-3 space-y-1 text-[13px]">
                <p class="font-medium text-slate-700">
                  {{ formatApprovalDecision(approval.decision) }}
                </p>
                <p class="text-slate-500">
                  {{ approval.usuario_nombre || 'Sin responsable asignado' }}
                </p>
                <p
                  v-if="approval.comentario"
                  class="mt-2 rounded-xl bg-slate-50 px-2.5 py-1.5 italic leading-relaxed text-slate-600"
                >
                  « {{ approval.comentario }} »
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContainer>
    </TabsContent>

    <TabsContent value="cliente" class="space-y-4">
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer class-name="rounded-3xl"><DetailSection title="Datos del cliente" :items="clientInfo" /></CardContainer>
        <CardContainer class-name="rounded-3xl"><DetailSection title="Domicilio" :items="clientAddress" /></CardContainer>
      </div>
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer class-name="rounded-3xl"><DetailSection title="Finanzas" :items="clientFinance" /></CardContainer>
        <CardContainer class-name="rounded-3xl"><DetailSection title="Referencias" :items="referenceClientItems" /></CardContainer>
      </div>
      <CardContainer class-name="rounded-3xl">
        <div>
          <h3 class="mb-4 text-lg font-semibold text-slate-800">Documentos del cliente</h3>
          <DocumentViewer :documents="clientDocuments" />
        </div>
      </CardContainer>
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer class-name="rounded-3xl"><DetailSection title="Activos del cliente" :items="clientAssetItems" /></CardContainer>
        <CardContainer class-name="rounded-3xl">
          <div>
            <h3 class="mb-4 text-lg font-semibold text-slate-800">Fotos de activos</h3>
            <DocumentViewer :documents="clientAssetPhotos" />
          </div>
        </CardContainer>
      </div>
    </TabsContent>

    <TabsContent value="aval" class="space-y-4">
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer class-name="rounded-3xl"><DetailSection title="Datos del aval" :items="guarantorInfo" /></CardContainer>
        <CardContainer class-name="rounded-3xl"><DetailSection title="Domicilio" :items="guarantorAddress" /></CardContainer>
      </div>
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer class-name="rounded-3xl"><DetailSection title="Finanzas" :items="guarantorFinance" /></CardContainer>
        <CardContainer class-name="rounded-3xl"><DetailSection title="Referencias" :items="referenceGuarantorItems" /></CardContainer>
      </div>
      <CardContainer class-name="rounded-3xl">
        <div>
          <h3 class="mb-4 text-lg font-semibold text-slate-800">Documentos del aval</h3>
          <DocumentViewer :documents="guarantorDocuments" />
        </div>
      </CardContainer>
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer class-name="rounded-3xl"><DetailSection title="Activos del aval" :items="guarantorAssetItems" /></CardContainer>
        <CardContainer class-name="rounded-3xl">
          <div>
            <h3 class="mb-4 text-lg font-semibold text-slate-800">Fotos de activos</h3>
            <DocumentViewer :documents="guarantorAssetPhotos" />
          </div>
        </CardContainer>
      </div>
    </TabsContent>

    <TabsContent value="credito" class="space-y-4">
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer class-name="rounded-3xl"><DetailSection title="Plan solicitado" :items="creditInfo" /></CardContainer>
        <CardContainer class-name="rounded-3xl">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-slate-800">Snapshot de tabla de cargos</h3>
            <div class="space-y-3 text-sm text-slate-700">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Identificador</p>
                <p class="mt-2 text-base font-semibold text-slate-900">
                  {{ planSnapshot?.identificador || 'Sin identificador' }}
                </p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan sugerido en revisión</p>
                <p class="mt-2 text-base font-semibold text-slate-900">
                  {{ request.revision?.tabla_cargos_id_sugerido || 'Sin ajuste' }}
                </p>
              </div>
            </div>
          </div>
        </CardContainer>
      </div>

      <CardContainer class-name="rounded-3xl">
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-slate-800">Ubicación de la solicitud</h3>
              <p class="mt-1 text-sm text-slate-500">
                Punto registrado por la app al momento de capturar la solicitud.
              </p>
            </div>
          </div>

          <div v-if="hasLocation" class="space-y-4">
            <div class="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <iframe
                :src="openStreetMapEmbedUrl"
                class="h-[320px] w-full border-0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Ubicación de la solicitud"
              />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Latitud</p>
                <p class="mt-2 text-base font-semibold text-slate-900">{{ request.gps_lat }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Longitud</p>
                <p class="mt-2 text-base font-semibold text-slate-900">{{ request.gps_lng }}</p>
              </div>
            </div>

            <div class="flex justify-end">
              <a
                :href="openStreetMapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Abrir en OpenStreetMap
              </a>
            </div>
          </div>

          <div
            v-else
            class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500"
          >
            Esta solicitud no trae coordenadas registradas.
          </div>
        </div>
      </CardContainer>
    </TabsContent>
  </Tabs>

  <!-- CTA fijo de aprobación — neutro -->
  <div
    v-if="canRegisterDecision"
    class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md"
  >
    <div class="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-slate-900">
          Revisión de {{ roleLabel.toLowerCase() }}
        </p>
        <p class="mt-0.5 truncate text-xs text-slate-500">
          {{ isApprovalAlreadyDecided
            ? (currentApproval?.usuario_nombre ?? 'Decisión ya registrada')
            : 'Pendiente de decisión del personal autorizado' }}
        </p>
      </div>

      <button
        v-if="extraReviewType"
        class="shrink-0 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        :disabled="isLoadingAction"
        @click="$emit('open:review', extraReviewType)"
      >
        Validar garantías
      </button>

      <button
        v-if="!isApprovalAlreadyDecided"
        class="shrink-0 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
        :disabled="isLoadingAction"
        @click="$emit('open:review', approvalType)"
      >
        Registrar decisión
      </button>
      <button
        v-else
        class="shrink-0 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        :disabled="isLoadingAction"
        @click="$emit('open:review', approvalType)"
      >
        Modificar
      </button>
    </div>
  </div>
  </div>
</template>
