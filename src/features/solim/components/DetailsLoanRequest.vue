<script setup lang="ts">
import { computed } from 'vue'
import {
  AlertCircle,
  CircleCheck,
  CircleDashed,
  CircleMinus,
  ClipboardList,
  CreditCard,
  FileCheck2,
  ShieldCheck,
  UserRoundCheck,
  XCircle
} from 'lucide-vue-next'
import CardContainer from '@/shared/components/CardContainer.vue'
import DocumentViewer from './DocumentViewer.vue'
import DetailSection from './DetailSection.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  ActivosData,
  ApprovalDecision,
  ApprovalRequirements,
  ApprovalType,
  RevisionApproval,
  Solicitud
} from '../types'

const PREVALIDATION_LABELS: Record<string, string> = {
  c01_docs_legibles: 'Los documentos se leyeron bien',
  c02_ine_cliente_vigente: 'La INE del cliente está vigente',
  c03_ine_aval_vigente: 'La INE del aval está vigente',
  c04_comprobante_cliente_reciente: 'El comprobante del cliente es reciente',
  c05_comprobante_aval_reciente: 'El comprobante del aval es reciente',
  c06_comprobante_agua_al_corriente_cliente: 'El agua del cliente está al corriente',
  c07_comprobante_agua_al_corriente_aval: 'El agua del aval está al corriente',
  c08_nombre_cliente_coincide: 'El nombre del cliente coincide con el documento',
  c09_nombre_aval_coincide: 'El nombre del aval coincide con el documento',
  c10_curp_cliente_valido: 'La CURP del cliente es válida',
  c11_curp_aval_valido: 'La CURP del aval es válida',
  c12_persona_id_cliente_asignado: 'El cliente fue identificado en sistema',
  c13_persona_id_aval_asignado: 'El aval fue identificado en sistema',
  c21_aumento_max_2000: 'El aumento respeta el límite permitido',
  c22_nivel_valido_por_scores: 'El nivel solicitado coincide con el historial',
  c24_ultima_semana_respetada: 'Se respetó la regla de última semana',
  c28_tabla_cargos_valida: 'El plan solicitado existe en tabla de cargos',
  c29_requiere_gerente: 'El plan requiere revisión de gerente',
  c30_requiere_oficina: 'El plan requiere revisión de oficina',
  c31_requiere_garantias: 'El plan requiere garantías',
  c32_requiere_seguridad: 'El plan requiere revisión de seguridad',
  c33_requiere_direccion: 'El plan requiere revisión de dirección'
}

interface Props {
  request: Solicitud
  approvalType: ApprovalType
  roleLabel: string
  canRegisterDecision: boolean
  isLoadingAction?: boolean
}

interface Emits {
  (e: 'open:review'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const requirements = computed<ApprovalRequirements | null>(
  () => props.request.approval_requirements ?? props.request.revision?.approval_requirements ?? null
)

const approvals = computed<RevisionApproval[]>(
  () => props.request.revision_aprobaciones ?? props.request.revision?.aprobaciones ?? []
)

const currentApproval = computed(
  () => approvals.value.find((approval) => approval.tipo === props.approvalType) ?? null
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
  { label: 'Persona ID', value: props.request.cliente_persona_id || 'Sin identificar' },
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
  { label: 'Persona ID', value: props.request.aval_persona_id || 'Sin identificar' },
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

const requirementChips = computed(() =>
  [
    { key: 'gerente', label: 'Gerente' },
    { key: 'oficina', label: 'Oficina' },
    { key: 'garantias', label: 'Garantías' },
    { key: 'seguridad', label: 'Seguridad' },
    { key: 'direccion', label: 'Dirección' }
  ].map((item) => ({
    ...item,
    required: Boolean(requirements.value?.[item.key as ApprovalType])
  }))
)

const prevalidationChecks = computed(() => {
  const checks = props.request.revision?.prevalidacion_app?.checks ?? props.request.prevalidacion_app?.checks
  if (!checks || typeof checks !== 'object') {
    return []
  }

  return Object.entries(checks)
    .filter(([, value]) => value !== null && value !== 'no_aplica')
    .map(([key, value]) => ({
      key,
      label: PREVALIDATION_LABELS[key] || key,
      ok: value === true
    }))
})

const prevalidationSummary = computed(() => ({
  total: prevalidationChecks.value.length,
  ok: prevalidationChecks.value.filter((check) => check.ok).length,
  pending: prevalidationChecks.value.filter((check) => !check.ok).length
}))

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

const revisionStatusConfig = computed(() => {
  const status = props.request.status_revision
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    sin_hallazgos: { label: 'Sin hallazgos', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    con_hallazgos: { label: 'Con hallazgos', bg: 'bg-amber-100', text: 'text-amber-800' },
    pendiente: { label: 'Pendiente', bg: 'bg-slate-100', text: 'text-slate-700' },
    aprobada: { label: 'Aprobada', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    aprobada_con_ajuste: { label: 'Aprobada con ajuste', bg: 'bg-blue-100', text: 'text-blue-800' },
    aprobada_condicionada: { label: 'Aprobada condicionada', bg: 'bg-blue-100', text: 'text-blue-800' },
    rechazada: { label: 'Rechazada', bg: 'bg-red-100', text: 'text-red-800' },
    corregir: { label: 'Corregir', bg: 'bg-amber-100', text: 'text-amber-800' },
    requiere_correccion: { label: 'Requiere corrección', bg: 'bg-amber-100', text: 'text-amber-800' }
  }
  return configs[status] ?? { label: status, bg: 'bg-slate-100', text: 'text-slate-700' }
})

const isApprovalAlreadyDecided = computed(() => {
  const decision = currentApproval.value?.decision
  return decision === 'aprobado' || decision === 'aprobado_con_ajuste' || decision === 'rechazado'
})

const approvalCtaConfig = computed(() => {
  const decision = currentApproval.value?.decision
  if (decision === 'aprobado' || decision === 'aprobado_con_ajuste') {
    return { borderColor: 'border-emerald-200', bgGradient: 'bg-[linear-gradient(180deg,#f0fdf4_0%,#dcfce7_100%)]', iconColor: 'text-emerald-600' }
  }
  if (decision === 'rechazado') {
    return { borderColor: 'border-red-200', bgGradient: 'bg-[linear-gradient(180deg,#fef2f2_0%,#fee2e2_100%)]', iconColor: 'text-red-600' }
  }
  return { borderColor: 'border-slate-200', bgGradient: 'bg-white', iconColor: 'text-[#0f4a67]' }
})

const APPROVAL_TYPE_LABELS: Record<string, string> = {
  gerente: 'Gerente',
  oficina: 'Oficina',
  garantias: 'Garantías',
  seguridad: 'Seguridad',
  direccion: 'Dirección'
}

function getApprovalCardConfig(decision?: ApprovalDecision) {
  switch (decision) {
    case 'aprobado':
    case 'aprobado_con_ajuste':
      return {
        border: 'border-emerald-200',
        bg: 'bg-[linear-gradient(180deg,#f0fdf4_0%,#ecfdf5_100%)]',
        icon: CircleCheck,
        iconColor: 'text-emerald-500',
        strip: 'bg-emerald-500'
      }
    case 'rechazado':
      return {
        border: 'border-red-200',
        bg: 'bg-[linear-gradient(180deg,#fef2f2_0%,#fef2f2_100%)]',
        icon: XCircle,
        iconColor: 'text-red-500',
        strip: 'bg-red-500'
      }
    case 'no_aplica':
      return {
        border: 'border-slate-200',
        bg: 'bg-slate-50',
        icon: CircleMinus,
        iconColor: 'text-slate-400',
        strip: 'bg-slate-300'
      }
    default:
      return {
        border: 'border-amber-200',
        bg: 'bg-[linear-gradient(180deg,#fffbeb_0%,#fef9c3_100%)]',
        icon: CircleDashed,
        iconColor: 'text-amber-500',
        strip: 'bg-amber-400'
      }
  }
}

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
  <div class="relative pb-52">
  <Tabs default-value="revision" class="space-y-4">
    <TabsList class="grid h-auto w-full grid-cols-4 rounded-[24px] bg-white p-2 shadow-sm">
      <TabsTrigger value="revision" class="rounded-[18px] py-3 text-sm font-semibold">Revisión</TabsTrigger>
      <TabsTrigger value="cliente" class="rounded-[18px] py-3 text-sm font-semibold">Cliente</TabsTrigger>
      <TabsTrigger value="aval" class="rounded-[18px] py-3 text-sm font-semibold">Aval</TabsTrigger>
      <TabsTrigger value="credito" class="rounded-[18px] py-3 text-sm font-semibold">Crédito</TabsTrigger>
    </TabsList>

    <TabsContent value="revision" class="space-y-4">
      <CardContainer>
        <div class="space-y-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <ShieldCheck class="size-5 text-[#0f4a67]" />
                Diagnóstico de revisión
              </p>
              <p class="mt-1 text-sm text-slate-500">
                Estado global del expediente y resumen de lo ya revisado.
              </p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="[revisionStatusConfig.bg, revisionStatusConfig.text]"
            >
              {{ revisionStatusConfig.label }}
            </span>
          </div>

          <div class="grid gap-y-4 border-t border-slate-200 pt-4 text-sm">
            <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <span class="text-slate-500">Motivo rechazo</span>
              <span class="text-right font-medium text-slate-800">{{ request.motivo_rechazo || '-' }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <span class="text-slate-500">Documento inválido</span>
              <span class="text-right font-medium text-slate-800">{{ request.doc_invalido_detalle || '-' }}</span>
            </div>
            <div class="space-y-2">
              <span class="text-slate-500">Diagnóstico</span>
              <p class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-base leading-relaxed text-slate-800">
                {{ request.diagnostico || 'Sin diagnóstico registrado.' }}
              </p>
            </div>
          </div>
        </div>
      </CardContainer>

      <div class="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <CardContainer>
          <div class="space-y-4">
            <p class="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <ClipboardList class="size-5 text-[#0f4a67]" />
              Requerimientos del plan
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in requirementChips"
                :key="item.key"
                v-show="item.required"
                class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900"
              >
                {{ item.label }}
              </span>
            </div>
            <p v-if="!requirementChips.some((item) => item.required)" class="text-sm text-slate-500">
              Este plan no requiere validaciones adicionales por área.
            </p>
          </div>
        </CardContainer>

        <CardContainer>
          <div class="space-y-4">
            <p class="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <FileCheck2 class="size-5 text-[#0f4a67]" />
              Prevalidación de la app
            </p>
            <div v-if="prevalidationChecks.length" class="space-y-4">
              <div class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                La app ya revisó una parte del expediente antes de llegar a esta pantalla. Esto sirve como referencia inicial para agilizar el filtrado.
              </div>
              <div class="grid gap-3 md:grid-cols-3">
                <div class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Revisiones útiles</p>
                  <p class="mt-2 text-lg font-semibold text-slate-900">{{ prevalidationSummary.total }}</p>
                </div>
                <div class="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Correctas</p>
                  <p class="mt-2 text-lg font-semibold text-emerald-900">{{ prevalidationSummary.ok }}</p>
                </div>
                <div class="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Por revisar</p>
                  <p class="mt-2 text-lg font-semibold text-amber-900">{{ prevalidationSummary.pending }}</p>
                </div>
              </div>
              <div
                v-for="check in prevalidationChecks"
                :key="check.key"
                class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <span class="pr-4 font-medium leading-6 text-slate-700">{{ check.label }}</span>
                <span
                  class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                  :class="check.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ check.ok ? 'Correcto' : 'Revisar' }}
                </span>
              </div>
            </div>
            <div
              v-else
              class="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500"
            >
              Esta solicitud aún no trae prevalidación desde la app.
            </div>
          </div>
        </CardContainer>
      </div>

      <CardContainer>
        <div class="space-y-4">
          <p class="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <AlertCircle class="size-5 text-[#0f4a67]" />
            Aprobaciones del flujo
          </p>
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="approval in approvals"
              :key="approval.tipo"
              class="relative overflow-hidden rounded-[20px] border p-4"
              :class="[getApprovalCardConfig(approval.decision).border, getApprovalCardConfig(approval.decision).bg]"
            >
              <!-- Strip lateral de estado -->
              <div
                class="absolute inset-y-0 left-0 w-1 rounded-l-[20px]"
                :class="getApprovalCardConfig(approval.decision).strip"
              />

              <div class="flex items-center gap-3">
                <component
                  :is="getApprovalCardConfig(approval.decision).icon"
                  class="size-6 shrink-0"
                  :class="getApprovalCardConfig(approval.decision).iconColor"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-sm font-semibold text-slate-900">
                      {{ APPROVAL_TYPE_LABELS[approval.tipo] || approval.tipo }}
                    </p>
                    <span
                      class="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="approval.requerido ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'"
                    >
                      {{ approval.requerido ? 'Requerido' : 'No aplica' }}
                    </span>
                  </div>
                  <p class="mt-0.5 text-sm font-medium" :class="getApprovalCardConfig(approval.decision).iconColor">
                    {{ formatApprovalDecision(approval.decision) }}
                  </p>
                </div>
              </div>

              <div class="mt-3 space-y-1 border-t border-black/5 pt-3 text-[13px] text-slate-600">
                <p>{{ approval.usuario_nombre || 'Sin responsable asignado' }}</p>
                <p v-if="approval.comentario" class="italic text-slate-500">« {{ approval.comentario }} »</p>
              </div>
            </div>
          </div>
        </div>
      </CardContainer>
    </TabsContent>

    <TabsContent value="cliente" class="space-y-4">
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer><DetailSection title="Datos del cliente" :items="clientInfo" /></CardContainer>
        <CardContainer><DetailSection title="Domicilio" :items="clientAddress" /></CardContainer>
      </div>
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer><DetailSection title="Finanzas" :items="clientFinance" /></CardContainer>
        <CardContainer><DetailSection title="Referencias" :items="referenceClientItems" /></CardContainer>
      </div>
      <CardContainer>
        <div>
          <h3 class="mb-4 text-lg font-semibold text-slate-800">Documentos del cliente</h3>
          <DocumentViewer :documents="clientDocuments" />
        </div>
      </CardContainer>
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer><DetailSection title="Activos del cliente" :items="clientAssetItems" /></CardContainer>
        <CardContainer>
          <div>
            <h3 class="mb-4 text-lg font-semibold text-slate-800">Fotos de activos</h3>
            <DocumentViewer :documents="clientAssetPhotos" />
          </div>
        </CardContainer>
      </div>
    </TabsContent>

    <TabsContent value="aval" class="space-y-4">
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer><DetailSection title="Datos del aval" :items="guarantorInfo" /></CardContainer>
        <CardContainer><DetailSection title="Domicilio" :items="guarantorAddress" /></CardContainer>
      </div>
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer><DetailSection title="Finanzas" :items="guarantorFinance" /></CardContainer>
        <CardContainer><DetailSection title="Referencias" :items="referenceGuarantorItems" /></CardContainer>
      </div>
      <CardContainer>
        <div>
          <h3 class="mb-4 text-lg font-semibold text-slate-800">Documentos del aval</h3>
          <DocumentViewer :documents="guarantorDocuments" />
        </div>
      </CardContainer>
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer><DetailSection title="Activos del aval" :items="guarantorAssetItems" /></CardContainer>
        <CardContainer>
          <div>
            <h3 class="mb-4 text-lg font-semibold text-slate-800">Fotos de activos</h3>
            <DocumentViewer :documents="guarantorAssetPhotos" />
          </div>
        </CardContainer>
      </div>
    </TabsContent>

    <TabsContent value="credito" class="space-y-4">
      <div class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <CardContainer><DetailSection title="Plan solicitado" :items="creditInfo" /></CardContainer>
        <CardContainer>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-slate-800">Snapshot de tabla de cargos</h3>
            <div class="space-y-3 text-sm text-slate-700">
              <div class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Identificador</p>
                <p class="mt-2 text-base font-semibold text-slate-900">
                  {{ planSnapshot?.identificador || 'Sin identificador' }}
                </p>
              </div>
              <div class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan sugerido en revisión</p>
                <p class="mt-2 text-base font-semibold text-slate-900">
                  {{ request.revision?.tabla_cargos_id_sugerido || 'Sin ajuste' }}
                </p>
              </div>
            </div>
          </div>
        </CardContainer>
      </div>

      <CardContainer>
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
            <div class="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
              <iframe
                :src="openStreetMapEmbedUrl"
                class="h-[320px] w-full border-0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Ubicación de la solicitud"
              />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Latitud</p>
                <p class="mt-2 text-base font-semibold text-slate-900">{{ request.gps_lat }}</p>
              </div>
              <div class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Longitud</p>
                <p class="mt-2 text-base font-semibold text-slate-900">{{ request.gps_lng }}</p>
              </div>
            </div>

            <div class="flex justify-end">
              <a
                :href="openStreetMapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Abrir en OpenStreetMap
              </a>
            </div>
          </div>

          <div
            v-else
            class="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500"
          >
            Esta solicitud no trae coordenadas registradas.
          </div>
        </div>
      </CardContainer>
    </TabsContent>
  </Tabs>

  <!-- CTA fijo de aprobación -->
  <div class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md">
    <div class="mx-auto max-w-2xl px-4 py-4">
      <div
        class="rounded-[24px] border px-5 py-4 shadow-sm"
        :class="[approvalCtaConfig.borderColor, approvalCtaConfig.bgGradient]"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="flex items-center gap-2 text-base font-semibold text-slate-800">
              <component
                :is="isApprovalAlreadyDecided ? CircleCheck : UserRoundCheck"
                class="size-5 shrink-0"
                :class="approvalCtaConfig.iconColor"
              />
              {{ formatApprovalDecision(currentApproval?.decision) }}
            </p>
            <p class="mt-0.5 text-sm text-slate-500">
              {{ currentApproval?.usuario_nombre || 'Sin responsable' }}
              <template v-if="currentApproval?.comentario"> · {{ currentApproval.comentario }}</template>
            </p>
          </div>
          <span
            class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            :class="currentApproval?.requerido ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'"
          >
            {{ currentApproval?.requerido ? 'Requerido' : 'No requerido' }}
          </span>
        </div>

        <button
          v-if="!isApprovalAlreadyDecided"
          class="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!canRegisterDecision || isLoadingAction"
          @click="$emit('open:review')"
        >
          {{ isLoadingAction ? 'Guardando...' : 'Registrar decisión' }}
        </button>
        <button
          v-else
          class="mt-3 inline-flex h-10 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          :disabled="isLoadingAction"
          @click="$emit('open:review')"
        >
          Modificar decisión
        </button>
      </div>
    </div>
  </div>
  </div>
</template>
