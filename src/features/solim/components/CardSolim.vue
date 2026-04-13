<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ApprovalType, Solicitud } from '@/features/solim/types'
import { ChevronDown } from 'lucide-vue-next'
import { toCurrency } from '@/shared/utils'
import SolicitudProgressSteps from './SolicitudProgressSteps.vue'
import { isNarrativeEmpty } from '@/features/solim/constants/filtradoCopy'

interface Props {
  solicitud: Solicitud
  approvalType: ApprovalType
}

interface Emits {
  (e: 'action:review', id: string): void
  (e: 'action:details', id: string): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const isExpanded = ref(false)

const currentApproval = computed(() => {
  const approvals = props.solicitud.revision_aprobaciones ?? props.solicitud.revision?.aprobaciones ?? []
  return approvals.find((approval) => approval.tipo === props.approvalType) ?? null
})

const approvalRequirement = computed(() => {
  const requirements = props.solicitud.approval_requirements ?? props.solicitud.revision?.approval_requirements
  return Boolean(requirements?.[props.approvalType])
})

const clientName = computed(() =>
  [
    props.solicitud.cliente_nombres,
    props.solicitud.cliente_ap_paterno,
    props.solicitud.cliente_ap_materno
  ]
    .filter(Boolean)
    .join(' ')
)

const statusLabel = computed(() => {
  const decision = currentApproval.value?.decision ?? 'pendiente'
  switch (decision) {
    case 'aprobado':
      return 'Aprobado'
    case 'aprobado_con_ajuste':
      return 'Con ajuste'
    case 'rechazado':
      return 'Rechazado'
    case 'no_aplica':
      return 'No aplica'
    default:
      return null
  }
})

const isDecided = computed(() => {
  const d = currentApproval.value?.decision
  return d === 'aprobado' || d === 'aprobado_con_ajuste' || d === 'rechazado'
})

const solicitudStatusLabel = computed(() => {
  switch (props.solicitud.status) {
    case 'capturada':
      return 'Capturada'
    case 'en_filtrado':
      return 'En evaluación'
    case 'en_correccion':
      return 'En corrección'
    case 'en_vistos_buenos':
      return 'En vistos buenos'
    case 'lista_desembolso':
      return 'Lista p/ desembolso'
    case 'desembolsada':
      return 'Desembolsada'
    case 'rechazada':
      return 'Rechazada'
    case 'cancelada':
      return 'Cancelada'
    default:
      return props.solicitud.status ?? 'Sin status'
  }
})

// Color del estado solo en el strip lateral izquierdo y el dot del badge.
const stripClass = computed(() => {
  const d = currentApproval.value?.decision
  if (d === 'aprobado' || d === 'aprobado_con_ajuste') return 'bg-emerald-500'
  if (d === 'rechazado') return 'bg-rose-500'
  if (d === 'no_aplica') return 'bg-slate-300'
  return 'bg-amber-400'
})

const diagnosticoText = computed(() => {
  const raw = props.solicitud.diagnostico ?? props.solicitud.revision?.diagnostico ?? null
  if (isNarrativeEmpty(raw)) return null
  return raw as string
})
</script>

<template>
  <article class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <!-- Strip lateral — único punto con color de estado -->
    <div class="absolute inset-y-0 left-0 w-1" :class="stripClass" aria-hidden="true" />

    <!-- Header compacto — siempre visible -->
    <button
      type="button"
      class="flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-slate-50/60"
      @click="isExpanded = !isExpanded"
    >
      <div class="min-w-0 flex-1 space-y-1.5">
        <p class="truncate text-[15px] font-semibold leading-tight text-slate-900">{{ clientName }}</p>
        <div class="flex items-center gap-1.5 text-[12px] text-slate-500">
          <span>{{ solicitud.agencia }}</span>
          <span class="text-slate-300">·</span>
          <span class="font-medium text-slate-700">{{ toCurrency(solicitud.monto_solicitado ?? 0) }}</span>
          <span class="text-slate-300">·</span>
          <span>{{ solicitud.plazo_semanas ?? '-' }} sem</span>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
          >
            {{ solicitudStatusLabel }}
          </span>
          <span
            v-if="statusLabel"
            class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700"
          >
            <span class="inline-block size-1.5 rounded-full" :class="stripClass" aria-hidden="true" />
            {{ statusLabel }}
          </span>
        </div>
      </div>

      <ChevronDown
        class="size-5 shrink-0 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
      />
    </button>

    <!-- Contenido expandible -->
    <div
      class="grid transition-[grid-template-rows] duration-200"
      :class="isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
    >
      <div class="overflow-hidden">
        <div class="space-y-3 border-t border-slate-100 px-5 pb-4 pt-3">
          <!-- Progress steps de la ruta -->
          <SolicitudProgressSteps :solicitud="solicitud" />

          <!-- Diagnóstico narrativo neutro, si existe -->
          <p
            v-if="diagnosticoText"
            class="line-clamp-3 text-[13px] leading-relaxed text-slate-600"
          >
            {{ diagnosticoText }}
          </p>

          <!-- Comentario del revisor (neutral) -->
          <div
            v-if="currentApproval?.comentario"
            class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-600"
          >
            <span class="font-semibold text-slate-700">Nota del revisor:</span> {{ currentApproval.comentario }}
          </div>

          <!-- Acciones -->
          <div class="flex gap-2 pt-1">
            <button
              class="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              @click="$emit('action:details', solicitud.id)"
            >
              Ver detalles
            </button>
            <button
              v-if="!isDecided && (approvalRequirement || currentApproval?.requerido === 1)"
              class="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800"
              @click="$emit('action:review', solicitud.id)"
            >
              Registrar decisión
            </button>
            <button
              v-else-if="isDecided"
              class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
              @click="$emit('action:review', solicitud.id)"
            >
              Modificar
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
