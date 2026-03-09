<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { computed, ref } from 'vue'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'
import { ChevronRight, LoaderCircle, Route } from 'lucide-vue-next'
import type { ApprovalRequirements, ApprovalType, RevisionApproval, RevisionStatus, Solicitud } from '../types'

interface StepItem {
  number: number
  title: string
  description: string
  status: 'complete' | 'pending' | 'warning' | 'progress'
  detail: string
}

const APPROVAL_LABELS: Record<ApprovalType, string> = {
  gerente: 'Gerente',
  oficina: 'Administración',
  garantias: 'Garantías',
  seguridad: 'Seguridad',
  direccion: 'Dirección general'
}

const props = defineProps<{
  solicitud: Solicitud
}>()

const bottomSheetRef = ref<InstanceType<typeof VueBottomSheet>>()

const approvalRequirements = computed<ApprovalRequirements | null>(() => {
  return props.solicitud.approval_requirements ?? props.solicitud.revision?.approval_requirements ?? null
})

const approvals = computed<RevisionApproval[]>(() => {
  return props.solicitud.revision_aprobaciones ?? props.solicitud.revision?.aprobaciones ?? []
})

const requiredApprovalTypes = computed<ApprovalType[]>(() => {
  const requirements = approvalRequirements.value
  if (requirements) {
    return (Object.keys(APPROVAL_LABELS) as ApprovalType[]).filter((tipo) => Boolean(requirements[tipo]))
  }

  const snapshotRequires =
    props.solicitud.tabla_cargos_snapshot?.requiere ?? props.solicitud.revision?.tabla_cargos_snapshot?.requiere
  if (snapshotRequires && typeof snapshotRequires === 'object') {
    return (Object.keys(APPROVAL_LABELS) as ApprovalType[]).filter((tipo) => Boolean(snapshotRequires[tipo]))
  }

  return approvals.value.filter((approval) => approval.requerido === 1).map((approval) => approval.tipo)
})

const prevalidationChecks = computed(() => {
  const checks =
    props.solicitud.prevalidacion_app?.checks ??
    props.solicitud.revision?.prevalidacion_app?.checks

  if (!checks || typeof checks !== 'object') {
    return []
  }

  return Object.values(checks).filter((value) => value !== null && value !== 'no_aplica')
})

const prevalidationStep = computed<StepItem>(() => {
  const checks = prevalidationChecks.value
  const okCount = checks.filter((value) => value === true).length

  if (checks.length === 0) {
    return {
      number: 1,
      title: 'Prevalidación app',
      description: 'La app revisa documentos y reglas iniciales.',
      status: 'pending',
      detail: 'Pendiente'
    }
  }

  if (okCount === checks.length) {
    return {
      number: 1,
      title: 'Prevalidación app',
      description: 'La app revisa documentos y reglas iniciales.',
      status: 'complete',
      detail: `${okCount}/${checks.length} correctas`
    }
  }

  return {
    number: 1,
    title: 'Prevalidación app',
    description: 'La app revisa documentos y reglas iniciales.',
    status: 'warning',
    detail: `${okCount}/${checks.length} correctas`
  }
})

const revisionStep = computed<StepItem>(() => {
  const status = props.solicitud.status_revision as RevisionStatus
  const hasDiagnosis = Boolean(props.solicitud.diagnostico || props.solicitud.revision?.diagnostico)

  if (status === 'aprobada' || status === 'aprobada_con_ajuste' || status === 'aprobada_condicionada') {
    return {
      number: 2,
      title: 'Filtro',
      description: 'La solicitud ya pasó por el filtro y el diagnóstico de oficina.',
      status: 'complete',
      detail: 'Concluido'
    }
  }

  if (status === 'rechazada' || status === 'corregir') {
    return {
      number: 2,
      title: 'Filtro',
      description: 'El filtro detectó observaciones y ya dejó un resultado para atender.',
      status: 'warning',
      detail: status === 'rechazada' ? 'Rechazada' : 'Corregir'
    }
  }

  return {
    number: 2,
    title: 'Filtro',
    description: 'La solicitud se está filtrando con reglas automáticas y revisión de oficina.',
    status: hasDiagnosis ? 'progress' : 'pending',
    detail: hasDiagnosis ? 'Filtrándose' : 'En espera'
  }
})

const approvalsSummary = computed(() => {
  const required = requiredApprovalTypes.value
  const relevant = approvals.value.filter((approval) => required.includes(approval.tipo))
  const resolved = relevant.filter(
    (approval) => approval.decision && approval.decision !== 'pendiente' && approval.decision !== 'no_aplica'
  )

  return {
    required,
    resolved
  }
})

const approvalsStep = computed<StepItem>(() => {
  const { required, resolved } = approvalsSummary.value

  if (required.length === 0) {
    return {
      number: 3,
      title: 'Vistos buenos',
      description: 'Checks exigidos por la tabla de cargos.',
      status: 'complete',
      detail: 'Sin requerimientos'
    }
  }

  if (resolved.length === 0) {
    return {
      number: 3,
      title: 'Vistos buenos',
      description: 'Checks exigidos por la tabla de cargos.',
      status: 'pending',
      detail: `${required.length} pendiente${required.length === 1 ? '' : 's'}`
    }
  }

  if (resolved.length < required.length) {
    return {
      number: 3,
      title: 'Vistos buenos',
      description: 'Checks exigidos por la tabla de cargos.',
      status: 'progress',
      detail: `${resolved.length}/${required.length} resueltos`
    }
  }

  return {
    number: 3,
    title: 'Vistos buenos',
    description: 'Checks exigidos por la tabla de cargos.',
    status: 'complete',
    detail: 'Completos'
  }
})

const steps = computed(() => [prevalidationStep.value, revisionStep.value, approvalsStep.value])

const requiredApprovalLabels = computed(() => {
  return requiredApprovalTypes.value.map((tipo) => APPROVAL_LABELS[tipo])
})

const routeSummary = computed(() => {
  const completed = steps.value.filter((step) => step.status === 'complete').length
  const warnings = steps.value.filter((step) => step.status === 'warning').length
  const inProgress = steps.value.filter((step) => step.status === 'progress').length

  if (warnings > 0) return 'Hay pasos que requieren atención'
  if (completed === steps.value.length) return 'Los 3 pasos ya quedaron cubiertos'
  if (inProgress > 0) return 'La solicitud sigue avanzando en su ruta de revisión'
  return 'Aún hay pasos pendientes por completar'
})

const compactPills = computed(() =>
  steps.value.map((step) => ({
    number: step.number,
    title: step.title,
    detail: step.detail,
    status: step.status
  }))
)

const createdAtLabel = computed(() => {
  const raw = props.solicitud.fecha_solicitud ?? props.solicitud.updated_at ?? null
  if (!raw) return 'Sin fecha registrada'

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return String(raw)

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City'
  }).format(date)
})

function stepClasses(status: StepItem['status']) {
  switch (status) {
    case 'complete':
      return {
        ring: 'border-emerald-200 bg-emerald-50',
        badge: 'bg-emerald-600 text-white',
        detail: 'text-emerald-700'
      }
    case 'warning':
      return {
        ring: 'border-amber-200 bg-amber-50',
        badge: 'bg-amber-500 text-white',
        detail: 'text-amber-700'
      }
    case 'progress':
      return {
        ring: 'border-blue-200 bg-blue-50',
        badge: 'bg-blue-600 text-white',
        detail: 'text-blue-700'
      }
    default:
      return {
        ring: 'border-slate-200 bg-slate-50',
        badge: 'bg-slate-200 text-slate-700',
        detail: 'text-slate-500'
      }
  }
}

function openSheet() {
  bottomSheetRef.value?.open()
}

function closeSheet() {
  bottomSheetRef.value?.close()
}

function isAnimatedStatus(status: StepItem['status']) {
  return status === 'pending' || status === 'progress'
}
</script>

<template>
  <button
    type="button"
    class="block w-full rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#fcfdff_0%,#f8fafc_100%)] px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
    @click="openSheet"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Route class="size-4" />
          </span>
          <p class="text-sm font-semibold text-slate-900">Ruta de la solicitud</p>
        </div>
        <p class="mt-2 text-sm leading-6 text-slate-500">{{ routeSummary }}</p>
        <p class="mt-2 text-xs font-medium text-slate-400">Creada en MX: {{ createdAtLabel }}</p>
      </div>
      <span class="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
        <ChevronRight class="size-4" />
      </span>
    </div>

    <div class="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
      <template v-for="(pill, index) in compactPills" :key="pill.number">
        <div
          class="inline-flex min-w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs"
          :class="stepClasses(pill.status).ring"
        >
          <span
            class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
            :class="stepClasses(pill.status).badge"
          >
            <LoaderCircle v-if="isAnimatedStatus(pill.status) && pill.number === 2" class="size-3.5 animate-spin" />
            <template v-else>{{ pill.number }}</template>
          </span>
          <span class="font-semibold text-slate-800">{{ pill.title }}</span>
          <span class="font-medium" :class="stepClasses(pill.status).detail">{{ pill.detail }}</span>
        </div>
        <div
          v-if="index < compactPills.length - 1"
          class="h-px min-w-6 flex-1 rounded-full bg-slate-200"
        />
      </template>
    </div>
  </button>

  <vue-bottom-sheet ref="bottomSheetRef" :max-width="920" :max-height="760">
    <div class="space-y-5 px-5 pb-8 pt-4">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Ruta de la solicitud</p>
          <h2 class="text-lg font-semibold tracking-[-0.02em] text-slate-900 sm:text-xl">Seguimiento del expediente</h2>
          <p class="max-w-xl text-sm leading-relaxed text-slate-600">
            Aquí puedes ver qué ya revisó la app, si la solicitud se está filtrando y qué vistos buenos exige el plan.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          @click="closeSheet"
        >
          Cerrar
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="(step, index) in steps"
          :key="step.number"
          class="relative pl-11"
        >
          <div
            v-if="index < steps.length - 1"
            class="absolute left-[0.85rem] top-9 h-[calc(100%+0.75rem)] w-px bg-gradient-to-b from-slate-200 via-slate-200 to-slate-100"
          />
          <span
            class="absolute left-0 top-5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold shadow-sm"
            :class="stepClasses(step.status).badge"
          >
            <LoaderCircle v-if="isAnimatedStatus(step.status) && step.number === 2" class="size-4 animate-spin" />
            <template v-else>{{ step.number }}</template>
          </span>

          <div
            class="rounded-[22px] border px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.02)] sm:px-5"
            :class="stepClasses(step.status).ring"
          >
            <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-[15px] font-semibold tracking-[-0.01em] text-slate-900 sm:text-base">{{ step.title }}</p>
                  <span class="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]" :class="stepClasses(step.status).detail">
                    Paso {{ step.number }}
                  </span>
                </div>
                <p class="mt-2 max-w-sm text-sm leading-7 text-slate-600">{{ step.description }}</p>
              </div>
              <div class="flex items-center sm:justify-end">
                <span class="shrink-0 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold" :class="stepClasses(step.status).detail">
                  {{ step.detail }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[20px] border border-slate-200 bg-white px-4 py-4">
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Creación</p>
        <p class="mt-2 text-sm font-semibold text-slate-900">{{ createdAtLabel }}</p>
      </div>

      <div v-if="requiredApprovalLabels.length" class="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Vistos buenos requeridos</p>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Este plan necesita la validación de las áreas que ves a continuación.
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="label in requiredApprovalLabels"
            :key="label"
            class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
          >
            {{ label }}
          </span>
        </div>
      </div>
    </div>
  </vue-bottom-sheet>
</template>
