<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BatteryLow, BatteryMedium, ChevronRight, ChevronLeft, Crosshair, Layers, MessageCircle, Phone, Search, X } from 'lucide-vue-next'
import { ROUTE_NAME } from '@/router'
import EquipoGpsChips from '../components/EquipoGpsChips.vue'
import EquipoGpsEstado from '../components/EquipoGpsEstado.vue'
import EquipoGpsPanel from '../components/EquipoGpsPanel.vue'
import { useEquipoGps } from '../composables/useEquipoGps'
import { agoShort, agruparPorSucursal, colorDe, estadoTexto, formatDistance, formatTime, initials, sucursalNombre, telUrl, textoAhora, titleCase, whatsappUrl } from '../equipo-gps.helpers'
import { equipoGpsService } from '../equipo-gps.service'
import type { GerenteEquipo, ResumenHoy } from '../equipo-gps.types'

// Lista primero: ~2 KB de API y nada de mapa. Leaflet entra sólo al cambiar al modo Mapa.
const EquipoGpsMapaEquipo = defineAsyncComponent(() => import('../components/EquipoGpsMapaEquipo.vue'))

const router = useRouter()
const {
  equipo, gerentes, conGerente, vacantes, activos, sinSenal, sucursales, visibles, filtro, sucursalFiltro,
  loading, error, now, updatedAt, cargar
} = useEquipoGps()

const modo = ref<'lista' | 'mapa'>('lista')
const busqueda = ref('')
const verVacantes = ref(false)
const seleccionado = ref<GerenteEquipo | null>(null)
const grupo = ref<GerenteEquipo[] | null>(null)
const leyenda = ref(false)
const panelAbierto = ref(false)
const altoPanel = ref(0)
const mapa = ref<{ encuadrar: () => void }>()

const grupos = computed(() => agruparPorSucursal(gerentes.value, filtro.value, busqueda.value, sucursalFiltro.value))
const total = computed(() => grupos.value.reduce((n, g) => n + g.gerentes.length, 0))
const conteos = computed(() => ({ todos: conGerente.value.filter((g) => !sucursalFiltro.value || g.sucursal === sucursalFiltro.value).length, activos: activos.value, sinSenal: sinSenal.value }))

const actualizado = computed(() => {
  if (loading.value && !equipo.value) return 'Cargando…'
  if (!updatedAt.value) return ''
  const s = Math.max(0, Math.round((now.value - updatedAt.value) / 1000))
  return s < 60 ? `Actualizado hace ${s} s` : `Actualizado ${agoShort(new Date(updatedAt.value).toISOString(), now.value)}`
})

function abrir(gerente: GerenteEquipo) {
  if (gerente.id === null) return
  router.push({ name: ROUTE_NAME.EQUIPO_GPS_DETALLE, params: { id: String(gerente.id) } })
}

// Ficha del mapa: al tocar un marcador se pide el resumen ligero del día (< 1 KB); mientras llega, esqueleto.
const resumenes = new Map<number, ResumenHoy>()
const resumen = ref<ResumenHoy | null>(null)
const cargandoResumen = ref(false)
function elegir(gerente: GerenteEquipo) {
  seleccionado.value = gerente
  grupo.value = null
  panelAbierto.value = false
  resumen.value = gerente.id !== null ? resumenes.get(gerente.id) ?? null : null
  if (gerente.id !== null && !resumen.value) {
    const id = gerente.id
    cargandoResumen.value = true
    equipoGpsService
      .resumenHoy(id)
      .then((data) => {
        resumenes.set(id, data)
        if (seleccionado.value?.id === id) resumen.value = data
      })
      .catch(() => {})
      .finally(() => (cargandoResumen.value = false))
  }
}
const cifras = computed(() => [
  { etiqueta: 'Recorrido', valor: resumen.value ? formatDistance(resumen.value.resumen.distancia_m) : null },
  { etiqueta: 'Paradas', valor: resumen.value ? String(resumen.value.resumen.paradas) : null },
  { etiqueta: 'Huecos', valor: resumen.value ? String(resumen.value.resumen.huecos) : null }
])
const bateria = computed(() => resumen.value?.bateria ?? seleccionado.value?.ubicacion?.bateria ?? null)
function elegirGrupo(lista: GerenteEquipo[]) {
  grupo.value = lista
  seleccionado.value = null
  panelAbierto.value = false
}
function cerrarPanel() {
  seleccionado.value = null
  grupo.value = null
}
// Al cambiar el filtro el mapa se ajusta a los visibles; la ficha de alguien que ya no se ve se cierra.
watch([filtro, sucursalFiltro], () => {
  if (seleccionado.value && !visibles.value.includes(seleccionado.value)) cerrarPanel()
  if (grupo.value) cerrarPanel()
})
const hayPanel = computed(() => !!seleccionado.value || !!grupo.value)
watch(hayPanel, (abierto) => { if (!abierto) altoPanel.value = 0 })

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
  <!-- ===================== Modo Lista ===================== -->
  <div v-if="modo === 'lista'" class="flex h-dvh flex-col bg-white">
    <header class="shrink-0 pt-2">
      <div class="flex h-12 items-center gap-2 px-4">
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
          <span v-if="loading" class="size-2 animate-pulse rounded-full bg-blue-600" aria-label="Actualizando" />
          {{ actualizado }}
        </span>
      </div>

      <div class="mx-4 mt-2 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-[13px] font-semibold" role="tablist">
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

      <div class="mt-2">
        <EquipoGpsChips v-model:filtro="filtro" v-model:sucursal="sucursalFiltro" :conteos="conteos" :sucursales="sucursales" />
      </div>

      <label class="relative mx-4 mt-1 block">
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

    <div
      ref="lista"
      class="relative min-h-0 flex-1 overflow-y-auto pt-2"
      @pointerdown="tiraInicio"
      @pointermove="tiraMueve"
      @pointerup="tiraFin"
      @pointercancel="tiraFin"
    >
      <div class="flex items-center justify-center overflow-hidden text-[13px] text-slate-500 transition-[height]" :style="{ height: `${tiron}px` }" aria-hidden="true">
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
      <p v-else-if="equipo && !total" class="px-4 py-8 text-center text-[16px] text-slate-600">Nadie coincide con el filtro.</p>

      <template v-else-if="equipo">
        <section v-for="g in grupos" :key="g.codigo">
          <h2 class="sticky top-0 z-10 flex h-8 items-center gap-2 bg-white/95 px-4 text-[13px] font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">
            <span class="size-2 rounded-full" :style="{ background: colorDe({ color: null, sucursal: g.codigo }) }" aria-hidden="true" />
            {{ g.nombre }} <span class="tabular-nums text-slate-400">· {{ g.gerentes.length }}</span>
          </h2>
          <ul class="divide-y divide-slate-100">
            <li v-for="p in g.gerentes" :key="p.gerencia">
              <button type="button" class="flex h-16 w-full items-center gap-3 px-4 text-left active:bg-slate-50" @click="abrir(p)">
                <span
                  class="size-2 shrink-0 rounded-full"
                  :class="p.estado === 'activo' ? 'bg-emerald-500' : p.estado === 'sin_app' ? 'border-2 border-dotted border-slate-400' : 'bg-white ring-2 ring-inset ring-slate-400'"
                  aria-hidden="true"
                />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[16px] font-medium leading-5 text-slate-900">{{ titleCase(p.nombre) }}</span>
                  <span class="block truncate text-[13px] leading-4 text-slate-500">
                    {{ p.gerencia }}<template v-if="p.estado !== 'activo' && p.estado !== 'sin_senal'"> · {{ estadoTexto(p.estado) }}</template>
                  </span>
                </span>
                <span class="shrink-0 text-right text-[13px] tabular-nums leading-4" :class="p.estado === 'activo' ? 'text-slate-500' : 'text-slate-400'">
                  {{ agoShort(p.ubicacion?.registrado_at, now) || (p.estado === 'sin_senal' ? 'sin señal' : '') }}
                </span>
                <ChevronRight class="size-4 shrink-0 text-slate-300" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </section>

        <section v-if="vacantes.length && filtro === 'todos' && !busqueda" class="mt-2 border-t border-slate-100">
          <button type="button" class="flex h-12 w-full items-center gap-2 px-4 text-left text-[13px] font-medium text-slate-500" :aria-expanded="verVacantes" @click="verVacantes = !verVacantes">
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
  </div>

  <!-- ===================== Modo Mapa: el mapa es el protagonista ===================== -->
  <div v-else class="relative h-dvh w-full overflow-hidden bg-slate-100">
    <div class="absolute inset-0">
      <EquipoGpsMapaEquipo
        ref="mapa"
        :gerentes="visibles"
        :seleccionado="seleccionado?.id ?? null"
        :margen-inferior="altoPanel"
        @seleccionar="elegir"
        @grupo="elegirGrupo"
        @fondo="cerrarPanel"
      />
    </div>

    <!-- Flotantes arriba: regresar 44 px, selector Lista|Mapa, actualizado -->
    <div class="pointer-events-none absolute inset-x-0 top-0 z-[600] px-4" style="padding-top: calc(env(safe-area-inset-top) + 16px)">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.16)] active:bg-slate-50"
          aria-label="Regresar"
          @click="router.back()"
        >
          <ChevronLeft class="size-6" />
        </button>
        <div class="pointer-events-auto grid h-11 flex-1 grid-cols-2 rounded-xl bg-white p-1 text-[13px] font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.16)]" role="tablist">
          <button
            v-for="opcion in ['lista', 'mapa'] as const"
            :key="opcion"
            type="button"
            role="tab"
            class="rounded-lg capitalize transition-colors"
            :class="modo === opcion ? 'bg-blue-600 text-white' : 'text-slate-600'"
            :aria-selected="modo === opcion"
            @click="modo = opcion"
          >
            {{ opcion }}
          </button>
        </div>
      </div>
      <div class="mt-2 flex justify-end">
        <span class="pointer-events-auto inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-3 text-[13px] text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.14)]" aria-live="polite">
          <span v-if="loading" class="size-2 animate-pulse rounded-full bg-blue-600" aria-label="Actualizando" />
          {{ actualizado || 'Mi equipo' }}
        </span>
      </div>
    </div>
    <div class="pointer-events-auto absolute inset-x-0 z-[600]" style="top: calc(env(safe-area-inset-top) + 104px)">
      <EquipoGpsChips v-model:filtro="filtro" v-model:sucursal="sucursalFiltro" :conteos="conteos" :sucursales="sucursales" flotante />
    </div>

    <!-- Abajo: leyenda plegable a la izquierda, Centrar a la derecha, atribución -->
    <div class="pointer-events-none absolute inset-x-4 z-[600] flex items-end justify-between" :style="{ bottom: `${(hayPanel ? altoPanel : 0) + 16}px` }">
      <button
        type="button"
        class="pointer-events-auto inline-flex h-8 items-center gap-3 rounded-full bg-white px-3 text-[13px] text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.14)]"
        :aria-expanded="leyenda"
        aria-label="Leyenda"
        @click="leyenda = !leyenda"
      >
        <template v-if="leyenda">
          <span class="inline-flex items-center gap-1.5"><span class="size-2.5 rounded-full bg-slate-700" /> Activo</span>
          <span class="inline-flex items-center gap-1.5"><span class="size-2.5 rounded-full border border-dotted border-slate-500 bg-slate-300" /> Sin señal</span>
          <span class="inline-flex items-center gap-1.5"><span class="inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-slate-300 px-1 text-[10px] font-bold">+N</span> juntos</span>
        </template>
        <span v-else class="inline-flex items-center gap-1.5 font-medium"><Layers class="size-4" /> Leyenda</span>
      </button>
      <button
        type="button"
        class="pointer-events-auto inline-flex size-11 items-center justify-center rounded-full bg-white text-blue-600 shadow-[0_2px_8px_rgba(15,23,42,0.16)] active:bg-slate-50"
        aria-label="Centrar en los visibles"
        @click="mapa?.encuadrar()"
      >
        <Crosshair class="size-5" />
      </button>
    </div>
    <a
      v-show="!hayPanel"
      class="absolute bottom-1 left-1/2 z-[600] -translate-x-1/2 rounded bg-white/80 px-1.5 text-[10px] text-slate-500"
      href="https://www.openstreetmap.org/copyright"
      target="_blank"
      rel="noopener"
    >© OpenStreetMap</a>

    <p v-if="equipo && !visibles.length" class="absolute inset-x-4 top-1/2 z-[600] -translate-y-1/2 rounded-xl bg-white p-4 text-center text-[16px] text-slate-600 shadow">
      Nadie con ubicación en este filtro.
    </p>

    <!-- Panel inferior: ficha corta de una persona o la lista de un grupo «+N» -->
    <!-- Nunca pasa de 60 %: los chips y el selector siguen a la vista. -->
    <EquipoGpsPanel v-if="hayPanel" v-model:abierto="panelAbierto" :asomado="grupo ? 0.42 : 0.3" :expandido="0.6" ajustado @altura="altoPanel = $event">
      <template #encabezado>
        <template v-if="seleccionado">
          <div class="flex items-center gap-3">
            <span class="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" :style="{ background: colorDe(seleccionado) }">{{ initials(seleccionado.nombre) }}</span>
            <div class="min-w-0 flex-1">
              <h2 class="truncate text-[20px] font-semibold leading-6 text-slate-900">{{ titleCase(seleccionado.nombre) }}</h2>
              <div class="mt-1 flex items-center justify-between gap-3">
                <p class="truncate text-[13px] leading-4 text-slate-500">{{ seleccionado.gerencia }} · {{ sucursalNombre(seleccionado.sucursal) }}</p>
                <EquipoGpsEstado :gerente="seleccionado" :now="now" chip />
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="grupo">
          <h2 class="text-[20px] font-semibold leading-6 text-slate-900">{{ grupo.length }} gerentes juntos</h2>
          <p class="mt-1 text-[13px] leading-4 text-slate-500">Toca a alguien para ver su ficha</p>
        </template>
      </template>

      <template v-if="seleccionado">
        <!-- Ahora: qué está haciendo; Hoy: cómo va su día. -->
        <dl class="mt-3 space-y-2 text-[13px]">
          <div class="flex items-baseline gap-3">
            <dt class="w-12 shrink-0 font-semibold uppercase tracking-wide text-slate-400">Ahora</dt>
            <dd class="min-w-0 flex-1 text-[16px] leading-5 text-slate-900">
              <span v-if="resumen">{{ textoAhora(resumen.ahora) }}<span v-if="resumen.ahora.cerca_ultima_parada && resumen.ahora.estado !== 'detenido'" class="text-slate-500"> · cerca de su última parada</span></span>
              <span v-else class="block h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            </dd>
          </div>
          <div class="flex items-baseline gap-3">
            <dt class="w-12 shrink-0 font-semibold uppercase tracking-wide text-slate-400">Hoy</dt>
            <dd class="min-w-0 flex-1 text-slate-600">
              <span v-if="resumen">Inició {{ resumen.inicio ? formatTime(resumen.inicio) : '—' }}</span>
              <span v-else class="block h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            </dd>
            <dd v-if="bateria !== null" class="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 tabular-nums" :class="bateria < 20 ? 'bg-amber-50 font-semibold text-amber-800' : 'text-slate-600'">
              <component :is="bateria < 20 ? BatteryLow : BatteryMedium" class="size-3.5" /> {{ bateria }} %
            </dd>
          </div>
        </dl>
        <div class="mt-3 grid grid-cols-3 gap-2" :aria-busy="cargandoResumen">
          <div v-for="c in cifras" :key="c.etiqueta" class="rounded-xl bg-slate-50 px-3 py-2 text-center">
            <p class="text-[13px] leading-4 text-slate-500">{{ c.etiqueta }}</p>
            <p v-if="c.valor !== null" class="mt-0.5 text-[16px] font-semibold tabular-nums leading-5 text-slate-900">{{ c.valor }}</p>
            <span v-else class="mx-auto mt-1.5 block h-4 w-10 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <div v-if="resumen?.telefono" class="mt-3 grid grid-cols-2 gap-2">
          <a :href="telUrl(resumen.telefono)" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-600 text-[16px] font-semibold text-blue-700 active:bg-blue-50"><Phone class="size-4" /> Llamar</a>
          <a :href="whatsappUrl(resumen.telefono)" target="_blank" rel="noopener" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-600 text-[16px] font-semibold text-blue-700 active:bg-blue-50"><MessageCircle class="size-4" /> WhatsApp</a>
        </div>
        <button
          type="button"
          class="mt-2 h-11 w-full rounded-xl bg-blue-600 text-[16px] font-semibold text-white active:bg-blue-700"
          @click="abrir(seleccionado)"
        >
          Ver recorrido
        </button>
      </template>
      <ul v-else-if="grupo" class="mt-2 divide-y divide-slate-100">
        <li v-for="p in grupo" :key="p.id ?? p.gerencia">
          <button type="button" class="flex h-14 w-full items-center gap-3 text-left active:bg-slate-50" @click="elegir(p)">
            <span class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" :style="{ background: colorDe(p) }">{{ initials(p.nombre) }}</span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[16px] font-medium leading-5 text-slate-900">{{ titleCase(p.nombre) }}</span>
              <span class="block truncate text-[13px] leading-4 text-slate-500">{{ p.gerencia }} · {{ sucursalNombre(p.sucursal) }}</span>
            </span>
            <EquipoGpsEstado :gerente="p" :now="now" />
          </button>
        </li>
      </ul>
    </EquipoGpsPanel>
  </div>
</template>
