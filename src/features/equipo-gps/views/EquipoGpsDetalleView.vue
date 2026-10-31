<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BatteryMedium, Crosshair, Route } from 'lucide-vue-next'
import MainCT from '@/shared/components/ui/MainCT.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import EquipoGpsEstado from '../components/EquipoGpsEstado.vue'
import { useEquipoGps } from '../composables/useEquipoGps'
import { formatDistance, formatTime } from '../equipo-gps.helpers'
import { equipoGpsError, equipoGpsService } from '../equipo-gps.service'
import type { RecorridoHoy } from '../equipo-gps.types'

// El mapa (Leaflet) se descarga sólo al llegar aquí; la lista nunca lo paga.
const EquipoGpsMapa = defineAsyncComponent(() => import('../components/EquipoGpsMapa.vue'))

const route = useRoute()
const router = useRouter()
const { equipo, now, cargar, gerente: buscar } = useEquipoGps()

const id = computed(() => Number(route.params.id))
const gerente = computed(() => buscar(id.value))

const recorrido = ref<RecorridoHoy | null>(null)
const cargandoRecorrido = ref(false)
const errorRecorrido = ref('')

onMounted(() => {
  // Entrada directa por URL: todavía no hay equipo en memoria.
  if (!equipo.value) void cargar()
})

async function verRecorrido() {
  if (cargandoRecorrido.value) return
  cargandoRecorrido.value = true
  errorRecorrido.value = ''
  try {
    recorrido.value = await equipoGpsService.recorridoHoy(id.value)
  } catch (cause) {
    errorRecorrido.value = equipoGpsError(cause, 'No se pudo cargar el recorrido.')
  } finally {
    cargandoRecorrido.value = false
  }
}

// Si cambia de gerente sin salir de la vista, el recorrido anterior no aplica.
watch(id, () => {
  recorrido.value = null
  errorRecorrido.value = ''
})

const resumen = computed(() => {
  const r = recorrido.value
  if (!r) return ''
  const paradas = `${r.resumen.paradas} ${r.resumen.paradas === 1 ? 'parada' : 'paradas'}`
  return `${formatDistance(r.resumen.distancia_m)} · ${paradas}${r.huecos.length ? ` · ${r.huecos.length} sin ubicación` : ''}`
})

const titulo = computed(() => gerente.value?.nombre ?? 'Gerente')
const subtitulos = computed(() =>
  gerente.value ? [`${gerente.value.gerencia} · ${gerente.value.usuario ?? ''}`] : ['Hoy · 07:00 a 20:00']
)
</script>

<template>
  <MainCT>
    <NavbarCT :title="titulo" :subtitles="subtitulos" show-back-button @back="router.back()" />

    <div class="mx-auto w-full max-w-2xl space-y-3 px-4 py-4 pb-12">
      <p
        v-if="equipo && !gerente"
        class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"
      >
        Ese gerente no está en tu equipo.
      </p>

      <template v-else-if="gerente">
        <section class="space-y-1 rounded-2xl border border-slate-200 bg-white p-4">
          <EquipoGpsEstado :gerente="gerente" :now="now" />
          <dl v-if="gerente.ubicacion" class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            <div class="inline-flex items-center gap-1">
              <Crosshair class="size-3.5" />
              <dt class="sr-only">Hora y precisión</dt>
              <dd>{{ formatTime(gerente.ubicacion.registrado_at) }} · ±{{ gerente.ubicacion.precision_m }} m</dd>
            </div>
            <div v-if="gerente.ubicacion.bateria !== null" class="inline-flex items-center gap-1">
              <BatteryMedium class="size-3.5" />
              <dt class="sr-only">Batería</dt>
              <dd>{{ gerente.ubicacion.bateria }} %</dd>
            </div>
          </dl>
          <p v-else class="text-xs text-slate-500">
            Sin ubicación que mostrar hoy en horario. El historial completo está en MOX.
          </p>
        </section>

        <EquipoGpsMapa
          v-if="gerente.ubicacion || recorrido"
          :ubicacion="gerente.ubicacion"
          :recorrido="recorrido"
          :en-vivo="gerente.estado === 'activo'"
        />

        <button
          v-if="gerente.estado !== 'sin_app' && !recorrido"
          type="button"
          class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
          :disabled="cargandoRecorrido"
          @click="verRecorrido"
        >
          <Route class="size-4" />
          {{ cargandoRecorrido ? 'Cargando recorrido…' : 'Ver recorrido de hoy' }}
        </button>

        <p v-if="resumen" class="px-1 text-sm text-slate-700">{{ resumen }}</p>
        <p v-if="errorRecorrido" class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
          {{ errorRecorrido }}
        </p>
      </template>

      <div v-else class="h-24 animate-pulse rounded-2xl bg-white" aria-busy="true" />
    </div>
  </MainCT>
</template>
