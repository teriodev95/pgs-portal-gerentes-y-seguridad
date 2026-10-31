<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, ChevronLeft, Search, X } from 'lucide-vue-next'
import { ROUTE_NAME } from '@/router'
import EquipoGpsEstado from '../components/EquipoGpsEstado.vue'
import { useEquipoGps } from '../composables/useEquipoGps'
import { agoShort, agruparPorSucursal, estadoTexto, sucursalNombre, titleCase } from '../equipo-gps.helpers'
import type { FiltroEquipo, GerenteEquipo } from '../equipo-gps.types'

// Lista primero: ~2 KB de API y nada de mapa. Leaflet entra sólo al cambiar al modo Mapa.
const EquipoGpsMapaEquipo = defineAsyncComponent(() => import('../components/EquipoGpsMapaEquipo.vue'))

const router = useRouter()
const { equipo, gerentes, conGerente, vacantes, activos, sinSenal, loading, error, now, updatedAt, cargar } =
  useEquipoGps()

const modo = ref<'lista' | 'mapa'>('lista')
const filtro = ref<FiltroEquipo>('todos')
const busqueda = ref('')
const verVacantes = ref(false)
const seleccionado = ref<GerenteEquipo | null>(null)

const grupos = computed(() => agruparPorSucursal(gerentes.value, filtro.value, busqueda.value))
const total = computed(() => grupos.value.reduce((n, g) => n + g.gerentes.length, 0))

const actualizado = computed(() => {
  if (loading.value && !equipo.value) return 'Cargando…'
  if (!updatedAt.value) return ''
  const s = Math.max(0, Math.round((now.value - updatedAt.value) / 1000))
  return s < 60 ? `Actualizado hace ${s} s` : `Actualizado ${agoShort(new Date(updatedAt.value).toISOString(), now.value)}`
})

const filtros = computed<{ id: FiltroEquipo; texto: string; n: number }[]>(() => [
  { id: 'todos', texto: 'Todos', n: conGerente.value.length },
  { id: 'activos', texto: 'Activos', n: activos.value },
  { id: 'sin_senal', texto: 'Sin señal', n: sinSenal.value }
])

function abrir(gerente: GerenteEquipo) {
  if (gerente.id === null) return
  router.push({ name: ROUTE_NAME.EQUIPO_GPS_DETALLE, params: { id: String(gerente.id) } })
}

// Jalar para actualizar: con la lista arriba, arrastrar hacia abajo más de 64 px recarga.
const tiron = ref(0)
let tironY0: number | null = null
const lista = ref<HTMLElement>()
function tiraInicio(e: PointerEvent) {
  if ((lista.value?.scrollTop ?? 0) <= 0 && e.pointerType === 'touch') tironY0 = e.clientY
}
function tiraMueve(e: PointerEvent) {
  if (tironY0 === null) return
  tiron.value = Math.min(96, Math.max(0, (e.clientY - tironY0) * 0.6))
}
function tiraFin() {
  if (tiron.value >= 64) void cargar()
  tiron.value = 0
  tironY0 = null
}
</script>

<template>
  <div class="flex h-dvh flex-col bg-white">
    <!-- Encabezado: regresar fantasma 40 px, título 22, actualizado a la derecha. -->
    <header class="shrink-0 px-4 pt-2">
      <div class="flex h-12 items-center gap-2">
        <button
          type="button"
          class="-ml-2 inline-flex size-10 items-center justify-center rounded-full text-slate-700 active:bg-slate-100"
          aria-label="Regresar"
          @click="router.back()"
        >
          <ChevronLeft class="size-6" />
        </button>
        <h1 class="flex-1 text-[22px] font-semibold leading-7 tracking-tight text-slate-900">Mi equipo</h1>
        <span class="inline-flex items-center gap-1.5 text-[13px] text-slate-500" aria-live="polite">
          <span
            v-if="loading"
            class="size-2 animate-pulse rounded-full bg-blue-600"
            aria-label="Actualizando"
          />
          {{ actualizado }}
        </span>
      </div>

      <div class="mt-2 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-[13px] font-semibold" role="tablist">
        <button
          v-for="opcion in ['lista', 'mapa'] as const"
          :key="opcion"
          type="button"
          role="tab"
          class="h-8 rounded-lg capitalize transition-colors"
          :class="modo === opcion ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'"
          :aria-selected="modo === opcion"
          @click="modo = opcion"
        >
          {{ opcion }}
        </button>
      </div>

      <div class="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por estado">
        <button
          v-for="f in filtros"
          :key="f.id"
          type="button"
          class="h-8 shrink-0 rounded-full px-3 text-[13px] font-medium transition-colors"
          :class="filtro === f.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 active:bg-slate-200'"
          :aria-pressed="filtro === f.id"
          @click="filtro = f.id"
        >
          {{ f.texto }} <span class="tabular-nums" :class="filtro === f.id ? 'text-blue-100' : 'text-slate-500'">{{ f.n }}</span>
        </button>
      </div>

      <label v-if="modo === 'lista'" class="relative mt-2 block">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="busqueda"
          type="search"
          inputmode="search"
          placeholder="Buscar gerente o gerencia"
          class="h-10 w-full rounded-xl bg-slate-100 pl-9 pr-9 text-[16px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          v-if="busqueda"
          type="button"
          class="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-500"
          aria-label="Borrar búsqueda"
          @click="busqueda = ''"
        >
          <X class="size-4" />
        </button>
      </label>
    </header>

    <!-- Lista -->
    <div
      v-if="modo === 'lista'"
      ref="lista"
      class="relative min-h-0 flex-1 overflow-y-auto pt-2"
      @pointerdown="tiraInicio"
      @pointermove="tiraMueve"
      @pointerup="tiraFin"
      @pointercancel="tiraFin"
    >
      <div
        class="flex items-center justify-center overflow-hidden text-[13px] text-slate-500 transition-[height]"
        :style="{ height: `${tiron}px` }"
        aria-hidden="true"
      >
        {{ tiron >= 64 ? 'Suelta para actualizar' : 'Jala para actualizar' }}
      </div>

      <div v-if="error" class="mx-4 mb-2 flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-900" role="alert">
        <span>{{ error }}</span>
        <button type="button" class="shrink-0 font-semibold text-blue-700" @click="cargar()">Reintentar</button>
      </div>

      <ul v-if="loading && !equipo" class="divide-y divide-slate-100" aria-busy="true">
        <li v-for="n in 8" :key="n" class="flex h-16 items-center gap-3 px-4">
          <span class="size-2 rounded-full bg-slate-200" />
          <span class="flex-1 space-y-2"><span class="block h-4 w-2/3 animate-pulse rounded bg-slate-200" /><span class="block h-3 w-1/4 animate-pulse rounded bg-slate-100" /></span>
        </li>
      </ul>

      <p v-else-if="equipo && !conGerente.length && !vacantes.length" class="px-4 py-8 text-center text-[16px] text-slate-600">
        No tienes gerencias asignadas. Pide a RH que las registre.
      </p>

      <p v-else-if="equipo && !total" class="px-4 py-8 text-center text-[16px] text-slate-600">
        Nadie coincide con el filtro.
      </p>

      <template v-else-if="equipo">
        <section v-for="grupo in grupos" :key="grupo.codigo">
          <h2 class="sticky top-0 z-10 flex h-8 items-center bg-white/95 px-4 text-[13px] font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">
            {{ grupo.nombre }} <span class="ml-1 tabular-nums text-slate-400">· {{ grupo.gerentes.length }}</span>
          </h2>
          <ul class="divide-y divide-slate-100">
            <li v-for="g in grupo.gerentes" :key="g.gerencia">
              <button
                type="button"
                class="flex h-16 w-full items-center gap-3 px-4 text-left active:bg-slate-50"
                @click="abrir(g)"
              >
                <span
                  class="size-2 shrink-0 rounded-full"
                  :class="g.estado === 'activo' ? 'bg-emerald-500' : g.estado === 'sin_app' ? 'border-2 border-dotted border-slate-400' : 'bg-white ring-2 ring-inset ring-slate-400'"
                  aria-hidden="true"
                />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[16px] font-medium leading-5 text-slate-900">{{ titleCase(g.nombre) }}</span>
                  <span class="block truncate text-[13px] leading-4 text-slate-500">
                    {{ g.gerencia }}<template v-if="g.estado !== 'activo' && g.estado !== 'sin_senal'"> · {{ estadoTexto(g.estado) }}</template>
                  </span>
                </span>
                <span class="shrink-0 text-right text-[13px] tabular-nums leading-4" :class="g.estado === 'activo' ? 'text-slate-500' : 'text-slate-400'">
                  {{ agoShort(g.ubicacion?.registrado_at, now) || (g.estado === 'sin_senal' ? 'sin señal' : '') }}
                </span>
                <ChevronRight class="size-4 shrink-0 text-slate-300" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </section>

        <section v-if="vacantes.length && filtro === 'todos' && !busqueda" class="mt-2 border-t border-slate-100">
          <button
            type="button"
            class="flex h-12 w-full items-center gap-2 px-4 text-left text-[13px] font-medium text-slate-500"
            :aria-expanded="verVacantes"
            @click="verVacantes = !verVacantes"
          >
            <ChevronRight class="size-4 transition-transform" :class="verVacantes && 'rotate-90'" />
            {{ vacantes.length }} {{ vacantes.length === 1 ? 'gerencia vacante' : 'gerencias vacantes' }}
          </button>
          <ul v-if="verVacantes" class="divide-y divide-slate-100 pb-4">
            <li v-for="v in vacantes" :key="v.gerencia" class="flex h-12 items-center gap-3 px-4 pl-10 text-[13px] text-slate-500">
              <span class="font-medium text-slate-600">{{ v.gerencia }}</span> · {{ sucursalNombre(v.sucursal) }} · sin gerente
            </li>
          </ul>
        </section>

        <p class="px-4 py-4 text-[13px] leading-5 text-slate-400">
          Verde: ubicación de hace 10 min o menos. Círculo gris: sin señal. Punteado: sin la app. Sólo hoy, de 07:00 a 20:00.
        </p>
      </template>
    </div>

    <!-- Modo Mapa -->
    <div v-else class="relative min-h-0 flex-1">
      <EquipoGpsMapaEquipo
        :gerentes="gerentes.filter((g) => filtro === 'todos' || (filtro === 'activos' ? g.estado === 'activo' : g.estado !== 'activo'))"
        :seleccionado="seleccionado?.id ?? null"
        @seleccionar="seleccionado = $event"
      />
      <a
        class="absolute bottom-2 right-2 z-[400] rounded bg-white/80 px-1.5 text-[10px] text-slate-500"
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener"
      >© OpenStreetMap</a>

      <!-- Ficha corta del marcador tocado -->
      <div
        v-if="seleccionado"
        class="absolute inset-x-4 bottom-4 z-[500] rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.16)]"
      >
        <p class="truncate text-[16px] font-semibold leading-5 text-slate-900">{{ titleCase(seleccionado.nombre) }}</p>
        <div class="mt-1 flex items-center justify-between gap-3">
          <p class="truncate text-[13px] leading-4 text-slate-500">{{ seleccionado.gerencia }} · {{ sucursalNombre(seleccionado.sucursal) }}</p>
          <EquipoGpsEstado :gerente="seleccionado" :now="now" chip />
        </div>
        <button
          type="button"
          class="mt-3 h-11 w-full rounded-xl bg-blue-600 text-[16px] font-semibold text-white active:bg-blue-700"
          @click="abrir(seleccionado)"
        >
          Ver recorrido
        </button>
      </div>
    </div>
  </div>
</template>
