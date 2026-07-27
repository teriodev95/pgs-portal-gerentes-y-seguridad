<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarCheck, ChevronRight } from 'lucide-vue-next'
// Se importa desde `names` (y no desde `@/router`) para no cerrar el ciclo
// router -> HomeView -> esta tarjeta -> router.
import { ROUTE_NAME } from '@/router/names'
import { securityAgendaService } from '../services/agenda.service'
import { useAgendaAccess } from '../composables/useAgendaAccess'
import { useAgendaCutoff } from '../composables/useAgendaCutoff'
import { todayISO } from '../utils/time'
import type { AgendaSummary } from '../types'

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

const detail = computed(() => {
  if (!summary.value || !summary.value.totalActividades) return 'Sin actividades'
  return `${summary.value.totalActividades} actividades · ${summary.value.completadas} hechas`
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
      // La tarjeta es una entrada secundaria del Home: si el servicio falla se
      // omite en silencio en lugar de meter ruido rojo en la pantalla principal.
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
  <button
    v-if="canUseAgenda && ready && !failed"
    type="button"
    class="w-full rounded-lg border bg-white p-3 text-left"
    :class="cutoff.tone === 'sent' ? 'border-green-600' : 'border-gray-200'"
    @click="open"
  >
    <!-- Enviada a tiempo: una sola línea; el resto del tiempo, con contexto -->
    <div class="flex items-center gap-2">
      <CalendarCheck
        class="size-4 shrink-0"
        :class="cutoff.tone === 'sent' ? 'text-green-700' : 'text-gray-600'"
        :stroke-width="2"
      />
      <span class="flex-1 text-sm font-semibold text-gray-900">Agenda de seguridad</span>
      <span
        class="text-xs font-medium"
        :class="{
          'text-green-800': cutoff.tone === 'sent',
          'text-red-800': cutoff.tone === 'late' || cutoff.tone === 'sent-late',
          'text-amber-800': cutoff.tone === 'warning',
          'text-gray-700': cutoff.tone === 'pending'
        }"
      >
        {{ cutoff.label }}
      </span>
      <ChevronRight class="size-4 shrink-0 text-gray-600" :stroke-width="2" />
    </div>

    <p v-if="!cutoff.collapsed" class="mt-1 pl-6 text-xs text-gray-700">{{ detail }}</p>
  </button>
</template>
