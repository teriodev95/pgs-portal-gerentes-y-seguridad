<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ApprovalType, Solicitud } from '@/features/solim/types'
import { BadgeDollarSign, ChevronDown, CircleCheck, CircleDashed, XCircle } from 'lucide-vue-next'
import { toCurrency } from '@/shared/utils'
import SolicitudProgressSteps from './SolicitudProgressSteps.vue'

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
      return 'Pendiente'
  }
})

const isDecided = computed(() => {
  const d = currentApproval.value?.decision
  return d === 'aprobado' || d === 'aprobado_con_ajuste' || d === 'rechazado'
})

const statusConfig = computed(() => {
  const d = currentApproval.value?.decision
  if (d === 'aprobado' || d === 'aprobado_con_ajuste')
    return { icon: CircleCheck, iconColor: 'text-emerald-500', badgeBg: 'bg-emerald-500', badgeText: 'text-white', strip: 'bg-emerald-500' }
  if (d === 'rechazado')
    return { icon: XCircle, iconColor: 'text-red-500', badgeBg: 'bg-red-500', badgeText: 'text-white', strip: 'bg-red-500' }
  return { icon: CircleDashed, iconColor: 'text-amber-500', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', strip: 'bg-amber-400' }
})
</script>

<template>
  <article class="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
    <!-- Strip lateral -->
    <div class="absolute inset-y-0 left-0 w-1" :class="statusConfig.strip" />

    <!-- Header compacto — siempre visible -->
    <button
      type="button"
      class="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50/60"
      @click="isExpanded = !isExpanded"
    >
      <component :is="statusConfig.icon" class="size-5 shrink-0" :class="statusConfig.iconColor" />

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p class="truncate text-[15px] font-semibold text-slate-900">{{ clientName }}</p>
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            :class="[statusConfig.badgeBg, statusConfig.badgeText]"
          >
            {{ statusLabel }}
          </span>
        </div>
        <div class="mt-0.5 flex items-center gap-2 text-[13px] text-slate-500">
          <span>{{ solicitud.agencia }}</span>
          <span class="text-slate-300">·</span>
          <span class="font-medium text-slate-700">{{ toCurrency(solicitud.monto_solicitado ?? 0) }}</span>
          <span class="text-slate-300">·</span>
          <span>{{ solicitud.plazo_semanas ?? '-' }} sem</span>
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
          <!-- Info cards inline -->
          <div class="grid gap-2 grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div class="flex items-center gap-1.5 text-slate-500">
                <BadgeDollarSign class="size-3.5" />
                <span class="text-[11px] font-semibold uppercase tracking-wider">Plan</span>
              </div>
              <p class="mt-1 text-lg font-semibold text-slate-900">{{ toCurrency(solicitud.monto_solicitado ?? 0) }}</p>
              <p class="text-[13px] text-slate-500">{{ solicitud.plazo_semanas ?? '-' }} sem · cargo {{ solicitud.tabla_cargos_snapshot?.id ?? solicitud.tabla_cargos_id ?? '-' }}</p>
            </div>

            <div
              class="rounded-xl border px-3 py-2.5"
              :class="isDecided
                ? (currentApproval?.decision === 'rechazado' ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50')
                : 'border-amber-200 bg-amber-50'"
            >
              <div class="flex items-center gap-1.5" :class="statusConfig.iconColor">
                <component :is="statusConfig.icon" class="size-3.5" />
                <span class="text-[11px] font-semibold uppercase tracking-wider">Revisión</span>
              </div>
              <p class="mt-1 text-base font-semibold text-slate-900">{{ statusLabel }}</p>
              <p class="text-[13px] text-slate-500">{{ currentApproval?.usuario_nombre || 'Sin responsable' }}</p>
            </div>
          </div>

          <!-- Progress steps -->
          <SolicitudProgressSteps :solicitud="solicitud" />

          <!-- Comentario si existe -->
          <div
            v-if="currentApproval?.comentario"
            class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900"
          >
            <span class="font-semibold">Comentario:</span> {{ currentApproval.comentario }}
          </div>

          <!-- Plan sugerido si existe -->
          <p
            v-if="currentApproval?.tabla_cargos_id_sugerido"
            class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-900"
          >
            Plan sugerido: {{ currentApproval.tabla_cargos_id_sugerido }}
          </p>

          <!-- Diagnóstico compacto -->
          <p
            v-if="solicitud.revision?.diagnostico"
            class="line-clamp-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-600"
          >
            {{ solicitud.revision.diagnostico }}
          </p>

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
              class="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
              @click="$emit('action:review', solicitud.id)"
            >
              Registrar check
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
