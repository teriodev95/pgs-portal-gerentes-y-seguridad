<script setup lang="ts">
import { computed } from 'vue'
import type { ApprovalType, Solicitud } from '@/features/solim/types'
import { BadgeDollarSign, ShieldCheck } from 'lucide-vue-next'
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
      return 'Aprobado con ajuste'
    case 'rechazado':
      return 'Rechazado'
    case 'no_aplica':
      return 'No aplica'
    default:
      return approvalRequirement.value ? 'Pendiente' : 'No requerido'
  }
})
</script>

<template>
  <article class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_-42px_rgba(15,23,42,0.35)]">
    <div class="border-b border-slate-200 bg-[linear-gradient(135deg,#0f4a67_0%,#0d3c55_100%)] px-5 py-4 text-white">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <p class="text-[19px] font-semibold tracking-[-0.02em]">{{ clientName }}</p>
          <p class="text-sm text-slate-100/85">
            {{ solicitud.agencia }} · {{ solicitud.gerencia }}
          </p>
          <p class="text-xs text-slate-100/70">{{ solicitud.id }}</p>
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <span
            class="inline-flex min-h-9 items-center rounded-full border px-4 py-2 text-xs font-semibold"
            :class="approvalRequirement ? 'border-white/25 bg-white/10 text-white' : 'border-white/15 bg-white/5 text-slate-100/75'"
          >
            {{ approvalRequirement ? 'Check requerido' : 'No requerido' }}
          </span>
          <span class="inline-flex min-h-9 items-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900">
            {{ statusLabel }}
          </span>
        </div>
      </div>
    </div>

    <section class="space-y-5 p-5">
      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div class="mb-2 flex items-center gap-2 text-slate-500">
            <BadgeDollarSign class="size-4" />
            <span class="text-xs font-semibold uppercase tracking-[0.18em]">Plan</span>
          </div>
          <p class="text-2xl font-semibold text-slate-900">
            {{ toCurrency(solicitud.monto_solicitado ?? 0) }}
          </p>
          <p class="mt-1 text-sm text-slate-600">
            {{ solicitud.plazo_semanas ?? '-' }} semanas · cargo {{ solicitud.tabla_cargos_snapshot?.id ?? solicitud.tabla_cargos_id ?? '-' }}
          </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div class="mb-2 flex items-center gap-2 text-slate-500">
            <ShieldCheck class="size-4" />
            <span class="text-xs font-semibold uppercase tracking-[0.18em]">Revisión</span>
          </div>
          <p class="text-lg font-semibold text-slate-900">{{ statusLabel }}</p>
          <p class="mt-1 text-sm text-slate-600">
            {{ props.approvalType === 'seguridad' ? 'Seguridad' : 'Gerente' }} ·
            {{ currentApproval?.usuario_nombre || 'Sin responsable' }}
          </p>
        </div>
      </div>

      <SolicitudProgressSteps :solicitud="solicitud" />

      <div class="rounded-[24px] border border-slate-200 bg-slate-50 p-2">
        <div class="grid gap-2 sm:grid-cols-2">
          <button
            class="inline-flex min-h-[52px] items-center justify-center rounded-[18px] border border-slate-300 bg-white px-5 text-[15px] font-semibold text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:border-slate-400 hover:bg-slate-100"
            @click="$emit('action:details', solicitud.id)"
          >
            Ver detalles
          </button>
          <button
            class="inline-flex min-h-[52px] items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#0f1b3d_0%,#111c45_100%)] px-5 text-[15px] font-semibold text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,0.6)] transition hover:brightness-110"
            @click="$emit('action:review', solicitud.id)"
          >
            Registrar check
          </button>
        </div>
      </div>
      <div
        v-if="currentApproval?.comentario"
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        <p class="mb-1 font-semibold">Comentario actual</p>
        <p class="leading-relaxed">{{ currentApproval.comentario }}</p>
      </div>
      <div
        v-if="currentApproval?.tabla_cargos_id_sugerido"
        class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      >
        Plan sugerido: {{ currentApproval.tabla_cargos_id_sugerido }}
      </div>
      <div
        v-if="solicitud.revision?.diagnostico"
        class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700"
      >
        {{ solicitud.revision.diagnostico }}
      </div>
      <div
        v-else
        class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-500"
      >
        Aún no hay diagnóstico registrado. Puedes abrir el detalle para revisar documentos, plan y requerimientos.
      </div>
    </section>
  </article>
</template>
