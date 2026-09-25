<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import type { Aviso } from '../types/avisos.types'
import { timeAgo } from '../constants/avisosCopy'
import { toTitleCase } from '@/shared/utils'
import {
  correctionTopicLabel,
  isMotivoRedundant,
  solicitudStatusLabel,
  solicitudStatusTone
} from '@/features/solim/constants/solicitudCopy'

const props = defineProps<{ aviso: Aviso }>()
defineEmits<{ (e: 'open', aviso: Aviso): void }>()

const correccion = computed(() => props.aviso.correccion ?? null)

const title = computed(() => (props.aviso.evento === 'correccion' ? 'Corrección solicitada' : props.aviso.titulo))

const subtitle = computed(() =>
  [props.aviso.cliente_nombre && toTitleCase(props.aviso.cliente_nombre), props.aviso.agencia].filter(Boolean).join(' · ')
)

const showMotivo = computed(
  () => correccion.value && !isMotivoRedundant(correccion.value.motivo, correccion.value.temas)
)

/** Resultado en verde (ya pasó) o siguiente paso en gris (qué falta). */
const outcome = computed(() => {
  if (correccion.value?.estado === 'corregida') {
    const when = correccion.value.corregida_at ? ` ${timeAgo(correccion.value.corregida_at)}` : ''
    return { text: `Corregida${when}`, done: true }
  }
  if (correccion.value?.estado === 'retirada') return { text: 'Oficina retiró la corrección', done: false }
  if (correccion.value) return { text: 'Esperando que el agente corrija', done: false }
  if (props.aviso.evento === 'rechazada') return { text: 'Informa al agente', done: false }

  const status = props.aviso.status_solicitud
  if (status === 'lista_desembolso') return { text: 'Lista para desembolso', done: false }
  if (status === 'desembolsada') return { text: 'Desembolsada', done: true }
  if (status === 'en_vistos_buenos') {
    const faltantes = props.aviso.vistos_buenos_faltantes ?? []
    return { text: faltantes.length ? `Faltan vistos buenos: ${faltantes.join(', ')}` : 'Faltan vistos buenos', done: false }
  }
  return null
})
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 text-left transition-colors active:bg-slate-100"
    @click="$emit('open', aviso)"
  >
    <div class="min-w-0 flex-1 space-y-1.5">
      <p v-if="aviso.requiere_accion" class="text-[11px] font-bold uppercase tracking-wide text-red-700">Requiere acción</p>
      <p class="text-[15px] font-semibold leading-snug text-slate-900">{{ title }}</p>
      <p v-if="subtitle" class="truncate text-sm text-slate-600">{{ subtitle }}</p>

      <!-- Qué pidió oficina: la instrucción y los temas, sin repetir el título. -->
      <div
        v-if="correccion"
        class="space-y-1.5 rounded-xl border px-3 py-2 text-sm"
        :class="correccion.estado === 'abierta' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'"
      >
        <p v-if="showMotivo" class="font-medium text-slate-900">{{ correccion.motivo }}</p>
        <p v-if="correccion.instruccion" class="text-slate-800">{{ correccion.instruccion }}</p>
        <div v-if="correccion.temas.length" class="flex flex-wrap gap-1">
          <span
            v-for="tema in correccion.temas"
            :key="tema"
            class="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700"
          >
            {{ correctionTopicLabel(tema) }}
          </span>
        </div>
        <p v-if="correccion.solicitada_por" class="text-xs text-slate-500">Pidió: {{ toTitleCase(correccion.solicitada_por) }}</p>
      </div>
      <p v-else-if="aviso.detalle" class="line-clamp-3 text-sm text-slate-700">{{ aviso.detalle }}</p>

      <p v-if="outcome" class="text-sm" :class="outcome.done ? 'font-semibold text-emerald-700' : 'text-slate-500'">
        {{ outcome.text }}
      </p>

      <div class="flex items-center gap-2 pt-0.5">
        <span
          v-if="aviso.status_solicitud"
          class="rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
          :class="solicitudStatusTone(aviso.status_solicitud)"
        >
          {{ solicitudStatusLabel(aviso.status_solicitud) }}
        </span>
        <span class="text-xs text-slate-500">{{ timeAgo(aviso.created_at) }}</span>
      </div>
    </div>

    <ChevronRight class="size-5 shrink-0 text-slate-400" aria-hidden="true" />
  </button>
</template>
