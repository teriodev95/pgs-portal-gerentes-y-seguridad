<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, RefreshCw } from 'lucide-vue-next'
import MainCT from '@/shared/components/ui/MainCT.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import { ROUTE_NAME } from '@/router'
import EquipoGpsEstado from '../components/EquipoGpsEstado.vue'
import { useEquipoGps } from '../composables/useEquipoGps'
import { formatTime } from '../equipo-gps.helpers'
import type { GerenteEquipo } from '../equipo-gps.types'

// Lista primero: ~2 KB de API y nada de mapa. El mapa y el recorrido se cargan al tocar a alguien.
const router = useRouter()
const { equipo, gerentes, activos, loading, error, now, cargar } = useEquipoGps()

const subtitulo = computed(() => {
  if (!equipo.value) return 'Hoy · 07:00 a 20:00'
  return `${activos.value} de ${gerentes.value.length} activos · ${formatTime(equipo.value.server_time)}`
})

function abrir(gerente: GerenteEquipo) {
  if (gerente.id === null) return
  router.push({ name: ROUTE_NAME.EQUIPO_GPS_DETALLE, params: { id: String(gerente.id) } })
}
</script>

<template>
  <MainCT>
    <NavbarCT title="Mi equipo GPS" :subtitles="[subtitulo]" show-back-button @back="router.back()">
      <template #estado>
        <button
          type="button"
          class="ml-1 inline-flex size-9 items-center justify-center rounded-full text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="loading"
          aria-label="Actualizar"
          @click="cargar()"
        >
          <RefreshCw class="size-4" :class="loading && 'animate-spin'" />
        </button>
      </template>
    </NavbarCT>

    <div class="mx-auto w-full max-w-2xl space-y-3 px-4 py-4 pb-12">
      <p
        v-if="error"
        class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        role="alert"
      >
        {{ error }}
      </p>

      <div v-if="loading && !equipo" class="space-y-2" aria-busy="true">
        <div v-for="n in 4" :key="n" class="h-16 animate-pulse rounded-xl bg-white" />
      </div>

      <p
        v-else-if="equipo && !gerentes.length"
        class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"
      >
        No tienes gerencias asignadas. Pide a RH que las registre.
      </p>

      <ul v-else class="space-y-2">
        <li v-for="gerente in gerentes" :key="gerente.gerencia">
          <button
            type="button"
            class="flex min-h-16 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left disabled:opacity-70"
            :disabled="gerente.id === null"
            @click="abrir(gerente)"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-slate-900">
                {{ gerente.nombre ?? 'Sin gerente' }}
              </p>
              <p class="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-600">
                <span class="font-medium text-slate-700">{{ gerente.gerencia }}</span>
                <EquipoGpsEstado :gerente="gerente" :now="now" />
              </p>
            </div>
            <ChevronRight v-if="gerente.id !== null" class="size-4 shrink-0 text-slate-400" />
          </button>
        </li>
      </ul>

      <p class="px-1 text-[11px] leading-snug text-slate-500">
        ● activo (captura de hace ≤10 min) · ○ sin señal · se muestra sólo el día de hoy, de 07:00 a 20:00.
      </p>
    </div>
  </MainCT>
</template>
