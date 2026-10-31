<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Crosshair, MessageCircle, Phone } from 'lucide-vue-next'
import EquipoGpsEstado from '../components/EquipoGpsEstado.vue'
import EquipoGpsPanel from '../components/EquipoGpsPanel.vue'
import { useEquipoGps } from '../composables/useEquipoGps'
import { formatDistance, formatTime, lineaDelDia, sucursalNombre, telUrl, titleCase, whatsappUrl } from '../equipo-gps.helpers'
import { equipoGpsError, equipoGpsService } from '../equipo-gps.service'
import type { EventoDia, RecorridoHoy } from '../equipo-gps.types'

// El mapa (Leaflet) se descarga sólo al llegar aquí; la lista nunca lo paga.
const EquipoGpsMapa = defineAsyncComponent(() => import('../components/EquipoGpsMapa.vue'))

const route = useRoute()
const router = useRouter()
const { equipo, now, cargar, gerente: buscar } = useEquipoGps()

const id = computed(() => Number(route.params.id))
const gerente = computed(() => buscar(id.value))

const recorrido = ref<RecorridoHoy | null>(null)
const cargando = ref(false)
const errorRecorrido = ref('')
const abierto = ref(false)
const altoPanel = ref(0)
const mapa = ref<{ encuadrar: () => void; centrar: (lugar: [number, number], zoom?: number) => void }>()

async function cargarRecorrido() {
  if (cargando.value || !Number.isFinite(id.value)) return
  cargando.value = true
  errorRecorrido.value = ''
  try {
    recorrido.value = await equipoGpsService.recorridoHoy(id.value)
  } catch (cause) {
    errorRecorrido.value = equipoGpsError(cause, 'No se pudo cargar el recorrido.')
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  // Entrada directa por URL: todavía no hay equipo en memoria.
  if (!equipo.value) void cargar()
  void cargarRecorrido()
})

watch(id, () => {
  recorrido.value = null
  void cargarRecorrido()
})

const enVivo = computed(() => gerente.value?.estado === 'activo')
const eventos = computed<EventoDia[]>(() => (recorrido.value ? lineaDelDia(recorrido.value, enVivo.value) : []))
const telefono = computed(() => recorrido.value?.telefono ?? null)

const datos = computed(() => [
  { etiqueta: 'Recorrido', valor: recorrido.value ? formatDistance(recorrido.value.resumen.distancia_m) : '—' },
  { etiqueta: 'Paradas', valor: recorrido.value ? String(recorrido.value.resumen.paradas) : '—' },
  { etiqueta: 'Huecos', valor: recorrido.value ? String(recorrido.value.huecos.length) : '—' }
])

function irA(evento: EventoDia) {
  if (evento.lugar) mapa.value?.centrar(evento.lugar)
}
</script>

<template>
  <div class="relative h-dvh w-full overflow-hidden bg-slate-100">
    <!-- Mapa a pantalla completa -->
    <div class="absolute inset-0">
      <EquipoGpsMapa
        v-if="gerente"
        ref="mapa"
        :ubicacion="gerente.ubicacion"
        :recorrido="recorrido"
        :en-vivo="enVivo"
        :margen-inferior="altoPanel"
      />
    </div>

    <!-- Botones flotantes 44 px: regresar y centrar -->
    <button
      type="button"
      class="absolute left-4 top-4 z-[600] inline-flex size-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.16)] active:bg-slate-50"
      style="top: calc(env(safe-area-inset-top) + 16px)"
      aria-label="Regresar"
      @click="router.back()"
    >
      <ChevronLeft class="size-6" />
    </button>
    <button
      type="button"
      class="absolute right-4 top-4 z-[600] inline-flex size-11 items-center justify-center rounded-full bg-white text-blue-600 shadow-[0_2px_8px_rgba(15,23,42,0.16)] active:bg-slate-50"
      style="top: calc(env(safe-area-inset-top) + 16px)"
      aria-label="Centrar el recorrido"
      @click="mapa?.encuadrar()"
    >
      <Crosshair class="size-5" />
    </button>
    <a
      v-show="!abierto"
      class="absolute left-1/2 z-[600] -translate-x-1/2 rounded bg-white/80 px-1.5 text-[10px] text-slate-500"
      :style="{ bottom: `${altoPanel + 8}px` }"
      href="https://www.openstreetmap.org/copyright"
      target="_blank"
      rel="noopener"
    >© OpenStreetMap</a>

    <!-- Panel inferior -->
    <EquipoGpsPanel v-if="gerente" v-model:abierto="abierto" @altura="altoPanel = $event">
      <template #encabezado>
        <!-- El nombre completo en su línea; gerencia y estado comparten la segunda. -->
        <h1 class="truncate text-[20px] font-semibold leading-6 text-slate-900">{{ titleCase(gerente.nombre) }}</h1>
        <div class="mt-1 flex items-center justify-between gap-3">
          <p class="truncate text-[13px] leading-4 text-slate-500">{{ gerente.gerencia }} · {{ sucursalNombre(gerente.sucursal) }}</p>
          <EquipoGpsEstado :gerente="gerente" :now="now" chip />
        </div>
      </template>

      <dl class="mt-3 grid grid-cols-3 gap-2">
        <div v-for="d in datos" :key="d.etiqueta" class="rounded-xl bg-slate-50 px-3 py-2 text-center">
          <dt class="text-[13px] leading-4 text-slate-500">{{ d.etiqueta }}</dt>
          <dd class="mt-0.5 text-[16px] font-semibold tabular-nums leading-5 text-slate-900" :class="cargando && 'animate-pulse'">{{ d.valor }}</dd>
        </div>
      </dl>

      <div v-if="telefono" class="mt-3 grid grid-cols-2 gap-2">
        <a :href="telUrl(telefono)" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 text-[16px] font-semibold text-white active:bg-blue-700">
          <Phone class="size-4" /> Llamar
        </a>
        <a :href="whatsappUrl(telefono)" target="_blank" rel="noopener" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-600 text-[16px] font-semibold text-blue-700 active:bg-blue-50">
          <MessageCircle class="size-4" /> WhatsApp
        </a>
      </div>

      <p v-if="errorRecorrido" class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-900" role="alert">
        <span>{{ errorRecorrido }}</span>
        <button type="button" class="shrink-0 font-semibold text-blue-700" @click="cargarRecorrido">Reintentar</button>
      </p>

      <!-- Abierto: la línea del día -->
      <section class="mt-4">
        <h2 class="text-[13px] font-semibold uppercase tracking-wide text-slate-500">Línea del día</h2>
        <p v-if="gerente.ubicacion" class="mt-1 text-[13px] leading-4 text-slate-500">
          {{ formatTime(gerente.ubicacion.registrado_at) }} · ±{{ gerente.ubicacion.precision_m }} m<template v-if="gerente.ubicacion.bateria !== null"> · batería {{ gerente.ubicacion.bateria }} %</template>
        </p>
        <ol v-if="eventos.length" class="mt-2 divide-y divide-slate-100">
          <li v-for="(evento, index) in eventos" :key="index">
            <button
              type="button"
              class="flex h-12 w-full items-center gap-3 text-left"
              :class="evento.lugar ? 'active:bg-slate-50' : 'cursor-default'"
              :disabled="!evento.lugar"
              @click="irA(evento)"
            >
              <span
                class="size-2 shrink-0 rounded-full"
                :class="evento.tipo === 'hueco' ? 'border border-dashed border-slate-400' : evento.tipo === 'parada' ? 'bg-slate-400' : 'bg-blue-600'"
                aria-hidden="true"
              />
              <span class="flex-1 text-[16px] leading-5" :class="evento.tipo === 'hueco' ? 'text-slate-400' : 'text-slate-900'">{{ evento.titulo }}</span>
              <span class="text-[13px] tabular-nums leading-4" :class="evento.tipo === 'hueco' ? 'text-slate-400' : 'text-slate-500'">{{ evento.detalle }}</span>
            </button>
          </li>
        </ol>
        <p v-else-if="!cargando && recorrido" class="mt-2 text-[13px] text-slate-500">Sin recorrido hoy en horario.</p>
        <ul v-else-if="cargando" class="mt-2 space-y-3" aria-busy="true">
          <li v-for="n in 4" :key="n" class="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </ul>
      </section>
    </EquipoGpsPanel>

    <p v-else-if="equipo" class="absolute inset-x-4 top-20 z-[600] rounded-xl bg-white p-4 text-[16px] text-slate-600 shadow">
      Ese gerente no está en tu equipo.
    </p>
  </div>
</template>
