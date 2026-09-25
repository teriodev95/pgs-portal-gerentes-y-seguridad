<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, PencilLine } from 'lucide-vue-next'
import CardContainer from '@/shared/components/CardContainer.vue'
import { formatToHumanDate, toTitleCase } from '@/shared/utils'
import type { CorreccionSolicitud } from '../types'
import { correctionTopicLabel, isMotivoRedundant } from '../constants/solicitudCopy'

const props = defineProps<{ correccion: CorreccionSolicitud }>()

const closedAt = computed(() => props.correccion.completed_at ?? props.correccion.cancelled_at)

const heading = computed(() => {
  if (props.correccion.completed_at) return `Corregida el ${formatToHumanDate(props.correccion.completed_at)}`
  if (props.correccion.cancelled_at) return `Oficina retiró la corrección el ${formatToHumanDate(props.correccion.cancelled_at)}`
  return 'Corrección solicitada'
})

const showMotivo = computed(() => !isMotivoRedundant(props.correccion.motivo, props.correccion.temas))

const requestedBy = computed(() => {
  const { solicitada_at } = props.correccion
  const solicitada_por = props.correccion.solicitada_por && toTitleCase(props.correccion.solicitada_por)
  const when = solicitada_at ? formatToHumanDate(solicitada_at, true) : null
  if (solicitada_por && when) return `Pedida por ${solicitada_por} el ${when}`
  if (solicitada_por) return `Pedida por ${solicitada_por}`
  return when ? `Pedida el ${when}` : null
})
</script>

<template>
  <CardContainer
    id="correccion-solicitada"
    :class-name="closedAt ? 'rounded-3xl border-slate-200' : 'rounded-3xl border-amber-300 bg-amber-50'"
  >
    <div class="space-y-3">
      <p class="flex items-center gap-2 text-lg font-semibold" :class="closedAt ? 'text-slate-700' : 'text-amber-900'">
        <CheckCircle2 v-if="correccion.completed_at" class="size-5 text-emerald-600" />
        <PencilLine v-else class="size-5" :class="closedAt ? 'text-slate-400' : 'text-amber-600'" />
        {{ heading }}
      </p>

      <div v-if="showMotivo">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Motivo</p>
        <p class="text-base text-slate-900">{{ correccion.motivo }}</p>
      </div>

      <div v-if="correccion.instruccion">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Qué debe corregir el agente</p>
        <p class="text-base text-slate-900">{{ correccion.instruccion }}</p>
      </div>

      <div v-if="correccion.temas.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="tema in correccion.temas"
          :key="tema"
          class="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700"
        >
          {{ correctionTopicLabel(tema) }}
        </span>
      </div>

      <p v-if="requestedBy" class="text-sm text-slate-500">{{ requestedBy }}</p>
    </div>
  </CardContainer>
</template>
