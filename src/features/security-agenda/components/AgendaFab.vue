<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarCheck } from 'lucide-vue-next'
// Se importa desde `names` (y no desde `@/router`) para no cerrar el ciclo
// router -> HomeView -> HomeMenu -> este botón -> router.
import { ROUTE_NAME } from '@/router/names'
import { securityAgendaService } from '../services/agenda.service'
import { useAgendaAccess } from '../composables/useAgendaAccess'
import { useAgendaCutoff } from '../composables/useAgendaCutoff'
import { todayISO } from '../utils/time'
import type { AgendaSummary } from '../types'

// Components
import FloatBtn from '@/shared/components/FloatBtn.vue'

const $router = useRouter()
const { canUseAgenda } = useAgendaAccess()

const fecha = ref(todayISO())
const summary = ref<AgendaSummary | null>(null)
const ready = ref(false)
const failed = ref(false)

const cutoffSource = computed(() =>
  summary.value
    ? {
        status: summary.value.status,
        enviadaAt: summary.value.enviadaAt,
        enviadaATiempo: summary.value.enviadaATiempo
      }
    : null
)
const { state: cutoff } = useAgendaCutoff(fecha, cutoffSource)

/**
 * Marca de estado: rojo pasado el corte, ámbar mientras todavía da tiempo, nada
 * cuando la agenda ya se envió. Un punto, nunca el fondo del botón: el color de
 * un FAB significa jerarquía, y ésta es una notificación.
 *
 * Sin respuesta todavía —o con el servicio caído— tampoco se pinta: el botón
 * existe antes que nada para entrar a la agenda, y una marca a ciegas afirmaría
 * algo que no sabemos.
 */
const markClass = computed(() => {
  if (!ready.value || failed.value) return ''

  switch (cutoff.value.tone) {
    case 'sent':
    case 'sent-late':
      return ''
    case 'late':
      return 'bg-red-700'
    default:
      return 'bg-amber-700'
  }
})

/** El mismo estado en palabras: el color no llega al lector de pantalla. */
const ariaLabel = computed(() => {
  if (!ready.value || failed.value) return 'Agenda de hoy'

  switch (cutoff.value.tone) {
    case 'sent':
    case 'sent-late':
      return 'Agenda de hoy, enviada'
    case 'late':
      return 'Agenda de hoy, pendiente de enviar, fuera de horario'
    default:
      return 'Agenda de hoy, pendiente de enviar'
  }
})

// El layout carga las gerencias despues de montar el Home, asi que un Regional
// llega aqui todavia sin ambito: se espera a que el acceso quede resuelto en vez
// de decidir una sola vez en `onMounted`.
watch(
  canUseAgenda,
  async (allowed) => {
    if (!allowed || ready.value) return

    try {
      const [first] = await securityAgendaService.listAgendas(fecha.value)
      summary.value = first ?? null
    } catch {
      // El botón es la entrada a la agenda: si el resumen falla se queda sin
      // marca, pero nunca sin botón.
      failed.value = true
    } finally {
      ready.value = true
    }
  },
  { immediate: true }
)

function open() {
  $router.push({ name: ROUTE_NAME.SECURITY_AGENDA })
}
</script>

<template>
  <!-- `size-11`: 44px de área táctil aunque el icono mida 20. -->
  <FloatBtn
    v-if="canUseAgenda"
    type="secondary"
    class="size-11 shrink-0"
    :aria-label="ariaLabel"
    @click="open"
  >
    <span class="relative flex items-center justify-center">
      <CalendarCheck class="size-5" :stroke-width="2" />
      <span
        v-if="markClass"
        class="absolute -right-1.5 -top-1.5 size-2.5 rounded-full ring-2 ring-white"
        :class="markClass"
      />
    </span>
  </FloatBtn>
</template>
