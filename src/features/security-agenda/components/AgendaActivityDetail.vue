<script setup lang="ts">
import { computed } from 'vue'
import { MapPinCheck } from 'lucide-vue-next'
import { PRIORITY_STYLE, STATUS_STYLE } from '../constants'
import { formatTimestampTime } from '../utils/time'
import type { AgendaActivity } from '../types'

// Components
import AgendaAgentContact from './AgendaAgentContact.vue'

interface Props {
  activity: AgendaActivity
  /**
   * El contacto del agente trae su celular personal, y esta ficha se lee con
   * sesión. Va apagado por defecto a propósito: quien la reutilice tiene que
   * encenderlo a mano, y así ninguna vista pública lo hereda por descuido —que
   * es justo como el nombre del cliente terminó en un enlace que circula por
   * WhatsApp—.
   */
  showAgentContact?: boolean
}

const props = withDefaults(defineProps<Props>(), { showAgentContact: false })

const statusStyle = computed(() => STATUS_STYLE[props.activity.status])
const priorityStyle = computed(() => PRIORITY_STYLE[props.activity.prioridad])

/** Los dos códigos son un solo dato; sin agencia, la gerencia se basta. */
const lugar = computed(() => {
  const { gerencia, agencia } = props.activity
  if (!gerencia) return ''
  return agencia ? `${gerencia} · ${agencia}` : gerencia
})

const visita = computed(() => props.activity.visita ?? null)

/** Sin `status` la evidencia sigue siendo evidencia: no se deja el separador solo. */
const evidencia = computed(() =>
  visita.value?.status ? `Visita registrada · ${visita.value.status}` : 'Visita registrada'
)

/**
 * Lo que escribe Administración al mover el estado. El histórico viene sin ello
 * en buena parte, así que cada bloque se pinta sólo si trae texto: un lector
 * lleno de "Sin comentario" cansa más de lo que informa.
 */
const tieneTexto = computed(
  () => !!props.activity.detalle || !!props.activity.comentario || !!props.activity.motivoCambio
)

/** Quién tocó la actividad por última vez. Sin nombre no hay nada que firmar. */
const tieneRastro = computed(
  () => !!props.activity.actualizadaPor || !!props.activity.actualizadaEn
)

const rastro = computed(() => {
  const { actualizadaPor, actualizadaEn } = props.activity
  const cuando = actualizadaEn ? formatTimestampTime(actualizadaEn) : ''
  if (actualizadaPor && cuando) return `${actualizadaPor} · ${cuando}`
  return actualizadaPor || cuando
})
</script>

<template>
  <!--
    Sólo se pinta lo que la actividad trae. Un lector que enumera "Sin detalle",
    "Sin agencia" y "Sin comentario" ocupa la pantalla entera para decir que no
    hay nada que decir; así, la actividad típica cabe de un vistazo.

    Los datos cortos van en renglones de etiqueta y valor, y los textos largos
    con la etiqueta encima: a un párrafo no le queda la media columna.
  -->
  <div class="divide-y divide-gray-200">
    <dl class="space-y-3 px-4 py-6">
      <div class="flex items-baseline justify-between gap-4">
        <dt class="text-sm text-gray-600">Estado</dt>
        <dd class="flex items-center gap-1.5 text-sm font-medium text-gray-900">
          <component :is="statusStyle.icon" class="size-4 shrink-0" :stroke-width="2" />
          {{ statusStyle.label }}
        </dd>
      </div>

      <div class="flex items-baseline justify-between gap-4">
        <dt class="text-sm text-gray-600">Prioridad</dt>
        <dd class="flex items-center gap-1.5 text-sm font-medium text-gray-900">
          <span class="size-2 shrink-0 rounded-full" :class="priorityStyle.dot" />
          {{ priorityStyle.label }}
        </dd>
      </div>

      <div v-if="lugar" class="flex items-baseline justify-between gap-4">
        <dt class="text-sm text-gray-600">Lugar</dt>
        <dd class="text-sm font-medium text-gray-900">{{ lugar }}</dd>
      </div>
    </dl>

    <!--
      A quién llamar en ese lugar, pegado al lugar. Un traslado no tiene agencia
      y por tanto no tiene a quién llamar: ahí no se pinta nada, ni el hueco.
    -->
    <AgendaAgentContact
      v-if="showAgentContact && activity.agencia"
      :agencia-id="activity.agencia"
    />

    <div v-if="tieneTexto" class="space-y-5 px-4 py-6">
      <div v-if="activity.detalle" class="space-y-1">
        <p class="text-sm text-gray-600">Detalle</p>
        <p class="whitespace-pre-line text-sm text-gray-900">{{ activity.detalle }}</p>
      </div>

      <div v-if="activity.comentario" class="space-y-1">
        <p class="text-sm text-gray-600">Comentario de Administración</p>
        <p class="whitespace-pre-line text-sm text-gray-900">{{ activity.comentario }}</p>
      </div>

      <div v-if="activity.motivoCambio" class="space-y-1">
        <p class="text-sm text-gray-600">Motivo del cambio</p>
        <p class="whitespace-pre-line text-sm text-gray-900">{{ activity.motivoCambio }}</p>
      </div>
    </div>

    <div v-if="visita" class="px-4 py-6">
      <!-- Evidencia de la visita ligada. Nunca coordenadas. -->
      <div class="space-y-1 rounded-lg bg-green-50 p-3 text-green-900">
        <p class="flex items-center gap-1.5 text-sm font-medium">
          <MapPinCheck class="size-4 shrink-0" :stroke-width="2" aria-hidden="true" />
          {{ evidencia }}
        </p>
        <p class="text-xs">{{ formatTimestampTime(visita.fecha) }}</p>
        <!-- Sin observaciones se dice, no se deja el hueco: mismo peso visual. -->
        <p class="text-xs">{{ visita.observaciones || 'Sin observaciones' }}</p>
      </div>
    </div>
  </div>

  <!-- Sin línea divisoria propia: es la firma de la ficha, no un dato más. -->
  <p v-if="tieneRastro" class="px-4 pb-6 text-xs text-gray-500">
    Última actualización: {{ rastro }}
  </p>
</template>
