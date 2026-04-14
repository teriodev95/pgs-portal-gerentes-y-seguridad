<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ChevronRight, LoaderCircle, Route } from 'lucide-vue-next'
import type {
  ApprovalRequirements,
  ApprovalType,
  RevisionApproval,
  RutaSolicitud,
  RutaSolicitudPaso,
  RutaSolicitudPasoId,
  Solicitud
} from '../types'
import { STEP_COPY } from '../constants/filtradoCopy'

interface StepItem {
  id: RutaSolicitudPasoId
  number: number
  title: string
  description: string
  status: 'complete' | 'pending' | 'warning' | 'progress' | 'neutral'
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

const isOpen = ref(false)

const rutaSolicitud = computed<RutaSolicitud | null>(() => props.solicitud.ruta_solicitud ?? null)

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

function toUiStatus(step: RutaSolicitudPaso, route: RutaSolicitud | null): StepItem['status'] {
  if (step.status === 'completo') return 'complete'
  if (step.status === 'bloqueado') return 'warning'
  if (step.status === 'no_aplica') return 'neutral'
  if (route?.paso_actual === step.id) return 'progress'
  return 'pending'
}

function formatStepDetail(step: RutaSolicitudPaso): string {
  if (step.status === 'no_aplica') {
    return 'Sin requerimientos'
  }

  if (step.id === 'prevalidacion_app') {
    if (step.status === 'completo') return 'Completada'
    if (step.total === 0) return 'En proceso'
    return `${step.completos}/${step.total}`
  }

  if (step.id === 'filtrado') {
    if (step.status === 'completo') return 'Completado'
    if (step.status === 'bloqueado') return 'Con observaciones'
    return 'En proceso'
  }

  if (step.total === 0) {
    return 'Sin requerimientos'
  }

  if (step.status === 'bloqueado') {
    const rejected = approvals.value.filter((a) => a.decision === 'rechazado')
    if (rejected.length > 0) {
      return `${rejected.length} rechazo${rejected.length > 1 ? 's' : ''}`
    }
    return 'Con observaciones'
  }

  if (step.status === 'completo') {
    return `${step.completos}/${step.total} resueltos`
  }

  return `${step.pendientes} pendiente${step.pendientes === 1 ? '' : 's'}`
}

const steps = computed<StepItem[]>(() => {
  const route = rutaSolicitud.value
  const pasos = route?.pasos ?? []

  return [...pasos]
    .sort((first, second) => first.orden - second.orden)
    .map((step) => ({
      id: step.id,
      number: step.orden,
      title: STEP_COPY[step.id].title,
      description: STEP_COPY[step.id].description,
      status: toUiStatus(step, route),
      detail: formatStepDetail(step)
    }))
})

const requiredApprovalLabels = computed(() => {
  return requiredApprovalTypes.value.map((tipo) => APPROVAL_LABELS[tipo])
})

const rejectedApprovals = computed(() =>
  approvals.value.filter((a) => a.decision === 'rechazado')
)

const routeSummary = computed(() => {
  const route = rutaSolicitud.value
  if (!route) return 'La ruta aún no está disponible'

  const currentStep = route.paso_actual ? STEP_COPY[route.paso_actual] : null

  if (route.status === 'bloqueada') {
    const rejected = approvals.value.filter((a) => a.decision === 'rechazado')
    if (rejected.length > 0) {
      const names = rejected.map((r) => APPROVAL_LABELS[r.tipo] || r.tipo)
      return `Rechazado por ${names.join(', ')}`
    }
    return currentStep ? `${currentStep.title} requiere atención` : 'Hay pasos que requieren atención'
  }

  if (route.status === 'completa') {
    return 'Todos los pasos ya quedaron cubiertos'
  }

  if (currentStep) {
    return `Pendiente en ${currentStep.title.toLowerCase()}`
  }

  return 'Aún hay pasos pendientes por completar'
})

const compactPills = computed(() =>
  steps.value.map((step) => ({
    id: step.id,
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
  // Ring (border/bg del card del step) se mantiene neutro siempre.
  // El color del estado vive solo en el círculo (badge) y en el detail text.
  const ring = 'border-slate-200 bg-white'

  switch (status) {
    case 'complete':
      return {
        ring,
        badge: 'bg-emerald-500 text-white',
        detail: 'text-emerald-700'
      }
    case 'warning':
      return {
        ring,
        badge: 'bg-amber-500 text-white',
        detail: 'text-amber-700'
      }
    case 'progress':
      return {
        ring,
        badge: 'bg-blue-600 text-white',
        detail: 'text-blue-700'
      }
    case 'neutral':
      return {
        ring,
        badge: 'bg-slate-200 text-slate-600',
        detail: 'text-slate-500'
      }
    default:
      return {
        ring,
        badge: 'bg-slate-200 text-slate-600',
        detail: 'text-slate-500'
      }
  }
}

function openSheet() {
  isOpen.value = true
}

function closeSheet() {
  isOpen.value = false
}

function isAnimatedStatus(status: StepItem['status']) {
  return status === 'progress'
}
</script>

<template>
  <button
    type="button"
    class="block w-full rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#fcfdff_0%,#f8fafc_100%)] px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
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

    <div v-if="compactPills.length" class="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
      <template v-for="(pill, index) in compactPills" :key="pill.number">
        <div
          class="inline-flex min-w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs"
          :class="stepClasses(pill.status).ring"
        >
          <span
            class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
            :class="stepClasses(pill.status).badge"
          >
            <LoaderCircle v-if="isAnimatedStatus(pill.status)" class="size-3.5 animate-spin" />
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
    <div
      v-else
      class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
    >
      Esta solicitud aún no expone una ruta de revisión.
    </div>
  </button>

  <Drawer :open="isOpen" @update:open="(value: boolean) => value ? null : closeSheet()">
    <DrawerContent class="max-h-[90vh]">
      <div class="mx-auto w-full max-w-4xl overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Seguimiento del expediente</DrawerTitle>
          <DrawerDescription>
            Aquí puedes ver qué ya revisó la app, si la solicitud se está filtrando y qué vistos buenos exige el plan.
          </DrawerDescription>
        </DrawerHeader>

        <div class="space-y-5 px-4 pb-8">

      <div v-if="steps.length" class="space-y-3">
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
            <LoaderCircle v-if="isAnimatedStatus(step.status)" class="size-4 animate-spin" />
            <template v-else>{{ step.number }}</template>
          </span>

          <div
            class="rounded-2xl border px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.02)] sm:px-5"
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

            <!-- Detalle de rechazos en vistos buenos -->
            <div
              v-if="step.id === 'vistos_buenos' && rejectedApprovals.length > 0"
              class="mt-3 space-y-2 border-t border-red-200/60 pt-3"
            >
              <div
                v-for="rejection in rejectedApprovals"
                :key="rejection.tipo"
                class="flex items-start gap-2.5 rounded-xl bg-red-50 px-3 py-2.5 text-[13px]"
              >
                <span class="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">✕</span>
                <div class="min-w-0">
                  <p class="font-semibold text-red-800">
                    {{ APPROVAL_LABELS[rejection.tipo] || rejection.tipo }}
                    <span v-if="rejection.usuario_nombre" class="font-normal text-red-700"> · {{ rejection.usuario_nombre }}</span>
                  </p>
                  <p v-if="rejection.comentario" class="mt-0.5 leading-relaxed text-red-700">
                    {{ rejection.comentario }}
                  </p>
                  <p v-else class="mt-0.5 italic text-red-600/70">Sin motivo registrado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-7 text-slate-500"
      >
        El servicio aún no devolvió `ruta_solicitud` para este expediente.
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4">
        <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Creación</p>
        <p class="mt-2 text-sm font-semibold text-slate-900">{{ createdAtLabel }}</p>
      </div>

      <div v-if="requiredApprovalLabels.length" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
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
      </div>
    </DrawerContent>
  </Drawer>
</template>
