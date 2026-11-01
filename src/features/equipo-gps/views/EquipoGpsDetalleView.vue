<script setup lang="ts">
// Detalle del recorrido: mapa de borde a borde; arriba sólo regresar, el chip de día/horas y el estado; abajo, al
// alcance del pulgar, el navegador de paradas (dentro del panel mínimo), Ruta | Solo paradas, ● En vivo y Centrar.
// Panel inferior de tres alturas: mínima (nombre, estado, navegador), media (cifras y acciones), completa (línea
// del día). Tocar algo en el mapa o en el panel hace lo mismo en los dos sitios (Norman: un solo modelo mental).
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentVisibility, useIntervalFn } from '@vueuse/core'
import { BatteryMedium, ChevronLeft, Clock3, Crosshair, LocateFixed, MessageCircle, Phone, X } from 'lucide-vue-next'
import EquipoGpsEstado from '../components/EquipoGpsEstado.vue'
import EquipoGpsFiltroHoras from '../components/EquipoGpsFiltroHoras.vue'
import EquipoGpsNavegador from '../components/EquipoGpsNavegador.vue'
import EquipoGpsPanel from '../components/EquipoGpsPanel.vue'
import { useEquipoGps } from '../composables/useEquipoGps'
import {
  agoShort, clock, colorDe, dayLabelCorto, epochAHora, formatDistance, formatTime, guardarSoloParadas, horaAEpoch,
  hoyMexico, isFresh, leerSoloParadas, lineaDelDia, pistas as armarPistas, sliceDay, sucursalNombre, telUrl,
  titleCase, whatsappUrl
} from '../equipo-gps.helpers'
import { equipoGpsError, equipoGpsService } from '../equipo-gps.service'
import type { DiaConDatos, EventoDia, RangoHoras, RecorridoHoy, UltimaPosicion } from '../equipo-gps.types'

// El mapa (Leaflet) se descarga sólo al llegar aquí; la lista nunca lo paga.
const EquipoGpsMapa = defineAsyncComponent(() => import('../components/EquipoGpsMapa.vue'))

const route = useRoute()
const router = useRouter()
const { equipo, now, cargar, gerente: buscar } = useEquipoGps()

const id = computed(() => Number(route.params.id))
const gerente = computed(() => buscar(id.value))
const hoy = hoyMexico()

// ---------- Día y horas (en la URL, para compartir el mismo enlace) ----------
const fecha = computed(() => {
  const q = typeof route.query.fecha === 'string' ? route.query.fecha : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : hoy
})
const horas = computed<RangoHoras | null>(() => {
  const desde = horaAEpoch(fecha.value, typeof route.query.desde === 'string' ? route.query.desde : null)
  const hasta = horaAEpoch(fecha.value, typeof route.query.hasta === 'string' ? route.query.hasta : null)
  if (desde === null && hasta === null) return null
  return { from: desde ?? 0, to: hasta }
})
const esHoy = computed(() => fecha.value === hoy)

function ponerQuery(cambios: Record<string, string | undefined>) {
  const query: Record<string, string> = {}
  for (const [k, v] of Object.entries({ ...route.query, ...cambios })) if (typeof v === 'string' && v) query[k] = v
  void router.replace({ query })
}

// ---------- Recorrido del día elegido ----------
const recorrido = ref<RecorridoHoy | null>(null)
const cargando = ref(false)
const errorRecorrido = ref('')

async function cargarRecorrido() {
  if (!Number.isFinite(id.value)) return
  cargando.value = true
  errorRecorrido.value = ''
  const pedido = `${id.value}|${fecha.value}`
  try {
    const data = esHoy.value ? await equipoGpsService.recorridoHoy(id.value) : await equipoGpsService.recorridoDia(id.value, fecha.value)
    if (pedido === `${id.value}|${fecha.value}`) recorrido.value = data
  } catch (cause) {
    errorRecorrido.value = equipoGpsError(cause, 'No se pudo cargar el recorrido.')
  } finally {
    cargando.value = false
  }
}

/** Lo que se dibuja: el día completo o sólo el tramo de horas elegido (cifras, paradas y línea se recalculan). */
const vista = computed(() => (recorrido.value && horas.value ? sliceDay(recorrido.value, horas.value) : recorrido.value))
const enVivoPosible = computed(() => esHoy.value && !horas.value)
const enMovimiento = computed(() => esHoy.value && gerente.value?.estado === 'activo')
const eventos = computed<EventoDia[]>(() => (vista.value ? lineaDelDia(vista.value, enMovimiento.value) : []))
const pistas = computed(() => (vista.value ? armarPistas(vista.value, enMovimiento.value) : []))
const telefono = computed(() => recorrido.value?.telefono ?? null)
const paradaDe = (evento: EventoDia) => (evento.tipo === 'parada' ? Number(evento.titulo.replace(/\D/g, '')) - 1 : null)

const datos = computed(() => [
  { etiqueta: 'Recorrido', valor: vista.value ? formatDistance(vista.value.resumen.distancia_m) : '—' },
  { etiqueta: 'Paradas', valor: vista.value ? String(vista.value.resumen.paradas) : '—' },
  { etiqueta: 'Huecos', valor: vista.value ? String(vista.value.huecos.length) : '—' }
])

// ---------- Días con datos y hoja de filtro ----------
const filtroAbierto = ref(false)
const dias = ref<DiaConDatos[]>([])
const cargandoDias = ref(false)
async function abrirFiltro() {
  filtroAbierto.value = true
  if (dias.value.length || cargandoDias.value) return
  cargandoDias.value = true
  try {
    dias.value = await equipoGpsService.diasConDatos(id.value)
  } catch {
    dias.value = []
  } finally {
    cargandoDias.value = false
  }
}
const aviso = ref('')
let avisoTimer: ReturnType<typeof setTimeout> | undefined
function avisar(texto: string) {
  aviso.value = texto
  clearTimeout(avisoTimer)
  avisoTimer = setTimeout(() => (aviso.value = ''), 1800)
}
function aplicarHoras(rango: RangoHoras | null) {
  ponerQuery({ desde: rango ? epochAHora(rango.from) : undefined, hasta: rango?.to ? epochAHora(rango.to) : undefined })
  filtroAbierto.value = false
  avisar(rango ? `Mostrando ${epochAHora(rango.from)}–${rango.to ? epochAHora(rango.to) : 'fin'}` : 'Todo el día')
  void nextTick(() => mapa.value?.encuadrar())
}
function elegirDia(nuevo: string) {
  if (nuevo === fecha.value) return
  ponerQuery({ fecha: nuevo === hoy ? undefined : nuevo, desde: undefined, hasta: undefined })
  avisar(nuevo === hoy ? 'Hoy' : dayLabelCorto(nuevo))
}
function quitarFiltro() {
  ponerQuery({ fecha: undefined, desde: undefined, hasta: undefined })
  avisar('Hoy · todo el día')
}
const chipFiltro = computed(() => {
  const dia = esHoy.value ? 'Hoy' : dayLabelCorto(fecha.value)
  if (!horas.value) return `${dia} · todo el día`
  return `${dia} · ${clock(horas.value.from)}–${horas.value.to ? clock(horas.value.to) : 'fin'}`
})

// ---------- Panel de tres alturas y selección compartida ----------
const NIVELES = [0.24, 0.5, 0.85]
const nivel = ref(0)
const altoPanel = ref(0)
const mapa = ref<{ encuadrar: () => void; centrar: (lugar: [number, number], zoom?: number) => void; seguir: (lugar: [number, number]) => void }>()
const filas = ref<HTMLElement>()
/** Índice en `pistas` (Inicio, paradas, Fin) de lo seleccionado; la parada resaltada sale de aquí. */
const pistaActual = ref<number | null>(null)
const paradaSeleccionada = computed(() => (pistaActual.value === null ? null : pistas.value[pistaActual.value]?.parada ?? null))

function irAPista(indice: number, volar = true) {
  const pista = pistas.value[indice]
  if (!pista) return
  pistaActual.value = indice
  if (volar) {
    pausarSeguimiento()
    mapa.value?.centrar(pista.lugar, 16)
  }
  if (nivel.value === 2) void nextTick(() => filas.value?.querySelector<HTMLElement>(`[data-pista="${indice}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
}
function pistaDeParada(index: number) {
  return pistas.value.findIndex((p) => p.parada === index)
}
function tocarParadaEnMapa(index: number) {
  const i = pistaDeParada(index)
  if (i >= 0) irAPista(i, false)
}
const pistaDeEvento = (evento: EventoDia) => {
  const parada = paradaDe(evento)
  if (parada !== null) return pistaDeParada(parada)
  if (evento.tipo === 'inicio') return 0
  if (evento.tipo === 'fin') return pistas.value.length - 1
  return -1
}
function tocarFila(evento: EventoDia) {
  const i = pistaDeEvento(evento)
  if (i >= 0) irAPista(i)
  else if (evento.lugar) mapa.value?.centrar(evento.lugar)
}
/** Tocar el texto central del navegador abre (o cierra) la fila de esa pista en el panel. */
function alternarFila() {
  if (nivel.value !== 2) {
    nivel.value = 2
    if (pistaActual.value !== null) irAPista(pistaActual.value, false)
  } else nivel.value = 1
}

// ---------- Ruta | Solo paradas (se recuerda por persona) ----------
const soloParadas = ref(false)
watch(id, (nuevo) => (soloParadas.value = leerSoloParadas(nuevo)), { immediate: true })
function ponerSoloParadas(valor: boolean) {
  soloParadas.value = valor
  guardarSoloParadas(id.value, valor)
  avisar(valor ? 'Solo paradas' : 'Ruta completa')
}

// ---------- En vivo ----------
const enVivo = ref(route.query.vivo === '1')
const siguiendo = ref(true)
const ultima = ref<UltimaPosicion | null>(null)
const visibility = useDocumentVisibility()
const tick = ref(Date.now())
useIntervalFn(() => (tick.value = Date.now()), 1000)

async function pedirUltima() {
  if (!enVivo.value || visibility.value !== 'visible' || !Number.isFinite(id.value)) return
  try {
    const data = await equipoGpsService.ultima(id.value)
    ultima.value = data
    if (siguiendo.value && data.ubicacion) mapa.value?.seguir([data.ubicacion.lat, data.ubicacion.lon])
  } catch {
    /* se reintenta en el siguiente ciclo */
  }
}
const sondeo = useIntervalFn(pedirUltima, 15_000, { immediate: false })
function sincronizarSondeo() {
  if (enVivo.value && visibility.value === 'visible' && enVivoPosible.value) {
    void pedirUltima()
    sondeo.resume()
  } else sondeo.pause()
}
watch([enVivo, visibility, enVivoPosible], sincronizarSondeo, { immediate: true })
// El mismo componente se reutiliza al cambiar sólo la query (p. ej. «Seguir en vivo» desde la ficha).
watch(() => route.query.vivo, (v) => { if ((v === '1') !== enVivo.value) { enVivo.value = v === '1'; siguiendo.value = true; if (!enVivo.value) ultima.value = null } })
function ponerEnVivo(valor: boolean) {
  enVivo.value = valor
  siguiendo.value = true
  ponerQuery({ vivo: valor ? '1' : undefined })
  if (!valor) ultima.value = null
}
function pausarSeguimiento() {
  if (enVivo.value) siguiendo.value = false
}
function reanudarSeguimiento() {
  siguiendo.value = true
  const u = ultima.value?.ubicacion ?? gerente.value?.ubicacion
  if (u) mapa.value?.seguir([u.lat, u.lon])
}
function centrarTodo() {
  pausarSeguimiento()
  mapa.value?.encuadrar()
}
const ubicacionViva = computed(() => (enVivo.value && ultima.value ? ultima.value.ubicacion : gerente.value?.ubicacion ?? null))
const fresca = computed(() => isFresh(ubicacionViva.value?.registrado_at, tick.value))
const textoVivo = computed(() => {
  if (!enVivo.value) return 'En vivo'
  const u = ubicacionViva.value
  if (!u) return 'Sin ubicación hoy'
  if (!fresca.value) return `Sin señal desde ${formatTime(u.registrado_at)}`
  const s = Math.max(0, Math.round((tick.value - Date.parse(u.registrado_at)) / 1000))
  return s < 60 ? `En vivo · hace ${s} s` : `En vivo · ${agoShort(u.registrado_at, tick.value)}`
})
onBeforeUnmount(() => {
  sondeo.pause()
  clearTimeout(avisoTimer)
})

// ---------- Carga ----------
onMounted(() => {
  if (!equipo.value) void cargar()
  void cargarRecorrido()
})
watch([id, fecha], () => {
  recorrido.value = null
  pistaActual.value = null
  dias.value = []
  void cargarRecorrido()
})
watch(horas, () => (pistaActual.value = null))

const titulo = computed(() => titleCase(gerente.value?.nombre))
</script>

<template>
  <div class="relative h-dvh w-full overflow-hidden bg-slate-100">
    <!-- Mapa de borde a borde -->
    <div class="absolute inset-0">
      <EquipoGpsMapa
        v-if="gerente"
        ref="mapa"
        :ubicacion="ubicacionViva"
        :recorrido="vista"
        :en-vivo="enMovimiento"
        :margen-inferior="altoPanel"
        :color="colorDe(gerente)"
        :parada-seleccionada="paradaSeleccionada"
        :solo-paradas="soloParadas"
        :estela="enVivo ? ultima?.estela ?? null : null"
        :pulsa="enVivo && fresca"
        @parada="tocarParadaEnMapa"
        @arrastre="pausarSeguimiento"
      />
    </div>

    <!-- Arriba, flotante: regresar, chip de día/horas -->
    <div class="pointer-events-none absolute inset-x-0 top-0 z-[600] flex items-center gap-2 px-4" style="padding-top: calc(env(safe-area-inset-top) + 16px)">
      <button
        type="button"
        class="pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.16)] active:bg-slate-50"
        aria-label="Regresar"
        @click="router.back()"
      >
        <ChevronLeft class="size-6" />
      </button>
      <div class="pointer-events-auto flex h-11 min-w-0 flex-1 items-center rounded-xl bg-white shadow-[0_2px_8px_rgba(15,23,42,0.16)]" :class="horas || !esHoy ? 'ring-2 ring-inset ring-blue-600' : ''">
        <button type="button" class="flex h-11 min-w-0 flex-1 items-center gap-2 px-3 text-left active:bg-slate-50" aria-label="Elegir día y horas" @click="abrirFiltro">
          <Clock3 class="size-4 shrink-0 text-blue-600" />
          <span class="truncate text-[13px] font-semibold text-slate-900">{{ chipFiltro }}</span>
        </button>
        <button
          v-if="horas || !esHoy"
          type="button"
          class="inline-flex size-11 shrink-0 items-center justify-center rounded-r-xl text-slate-500 active:bg-slate-50"
          aria-label="Quitar el filtro"
          @click="quitarFiltro"
        >
          <X class="size-4" />
        </button>
      </div>
    </div>

    <!-- Aviso breve al aplicar un filtro -->
    <Transition enter-active-class="transition-opacity" leave-active-class="transition-opacity" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <p v-if="aviso" class="pointer-events-none absolute left-1/2 top-24 z-[650] -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/85 px-4 py-2 text-[13px] font-medium text-white" role="status">{{ aviso }}</p>
    </Transition>

    <!-- Abajo, al alcance del pulgar: Ruta | Solo paradas, En vivo, Seguir y Centrar (con el panel completo se ocultan: el mapa ya no se ve) -->
    <div v-show="nivel < 2" class="pointer-events-none absolute inset-x-4 z-[600] flex items-end justify-between gap-2" :style="{ bottom: `${altoPanel + 16}px` }">
      <div class="flex min-w-0 flex-col items-start gap-2">
        <div class="pointer-events-auto grid h-10 grid-cols-2 rounded-xl bg-white p-1 text-[13px] font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.16)]" role="group" aria-label="Qué se dibuja">
          <button type="button" class="rounded-lg px-3 transition-colors" :class="!soloParadas ? 'bg-blue-600 text-white' : 'text-slate-600 active:bg-slate-100'" :aria-pressed="!soloParadas" @click="ponerSoloParadas(false)">Ruta</button>
          <button type="button" class="whitespace-nowrap rounded-lg px-3 transition-colors" :class="soloParadas ? 'bg-blue-600 text-white' : 'text-slate-600 active:bg-slate-100'" :aria-pressed="soloParadas" @click="ponerSoloParadas(true)">Solo paradas</button>
        </div>
        <button
          v-if="enVivoPosible"
          type="button"
          role="switch"
          :aria-checked="enVivo"
          class="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.16)] transition-colors"
          :class="enVivo ? (fresca ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-2 ring-inset ring-blue-600') : 'bg-white text-slate-700 active:bg-slate-50'"
          @click="ponerEnVivo(!enVivo)"
        >
          <span class="size-2.5 rounded-full" :class="enVivo && fresca ? 'animate-pulse bg-emerald-400' : enVivo ? 'bg-slate-400' : 'bg-slate-300'" aria-hidden="true" />
          <span class="tabular-nums">{{ textoVivo }}</span>
        </button>
      </div>
      <div class="flex flex-col items-end gap-2">
        <button
          v-if="enVivo && !siguiendo"
          type="button"
          class="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-3 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(15,23,42,0.16)] active:bg-blue-700"
          @click="reanudarSeguimiento"
        >
          <LocateFixed class="size-4" /> Seguir
        </button>
        <button
          type="button"
          class="pointer-events-auto inline-flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-[13px] font-semibold text-blue-700 shadow-[0_2px_8px_rgba(15,23,42,0.16)] active:bg-slate-50"
          aria-label="Centrar el recorrido"
          @click="centrarTodo"
        >
          <Crosshair class="size-5" /> Centrar
        </button>
      </div>
    </div>
    <a
      v-show="nivel === 0"
      class="absolute left-1/2 z-[600] -translate-x-1/2 rounded bg-white/80 px-1.5 text-[10px] text-slate-500"
      :style="{ bottom: `${altoPanel + 2}px` }"
      href="https://www.openstreetmap.org/copyright"
      target="_blank"
      rel="noopener"
    >© OpenStreetMap</a>

    <!-- Panel inferior de tres alturas -->
    <EquipoGpsPanel v-if="gerente" v-model:nivel="nivel" :niveles="NIVELES" ajustado @altura="altoPanel = $event">
      <template #encabezado>
        <h1 class="truncate text-[20px] font-semibold leading-6 text-slate-900">{{ titulo }}</h1>
        <div class="mt-1 flex items-center justify-between gap-3">
          <p class="truncate text-[13px] leading-4 text-slate-500">{{ gerente.gerencia }} · {{ sucursalNombre(gerente.sucursal) }}</p>
          <EquipoGpsEstado :gerente="gerente" :now="now" chip />
        </div>
        <div class="mt-3">
          <EquipoGpsNavegador v-if="pistas.length" :pistas="pistas" :indice="pistaActual" @ir="irAPista" @centro="alternarFila" />
          <div v-else-if="cargando" class="h-12 animate-pulse rounded-xl bg-slate-100" aria-busy="true" />
          <p v-else class="h-12 rounded-xl bg-slate-50 px-3 text-center text-[13px] leading-[48px] text-slate-500">Sin recorrido en este día u horario.</p>
        </div>
      </template>

      <!-- Media: cifras y acciones -->
      <dl class="mt-3 grid grid-cols-3 gap-2">
        <div v-for="d in datos" :key="d.etiqueta" class="rounded-xl bg-slate-50 px-3 py-2 text-center">
          <dt class="text-[13px] leading-4 text-slate-500">{{ d.etiqueta }}</dt>
          <dd class="mt-0.5 text-[16px] font-semibold tabular-nums leading-5 text-slate-900" :class="cargando && 'animate-pulse'">{{ d.valor }}</dd>
        </div>
      </dl>
      <!-- Pista para descubrir las horas de paso; va en lugar de una leyenda. -->
      <p v-if="!soloParadas && vista?.tramos.length" class="mt-2 text-[12px] leading-4 text-slate-500">Las flechas marcan el sentido · toca la ruta para ver la hora.</p>
      <div v-if="telefono" class="mt-3 grid grid-cols-2 gap-2">
        <a :href="telUrl(telefono)" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 text-[16px] font-semibold text-white active:bg-blue-700"><Phone class="size-4" /> Llamar</a>
        <a :href="whatsappUrl(telefono)" target="_blank" rel="noopener" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-600 text-[16px] font-semibold text-blue-700 active:bg-blue-50"><MessageCircle class="size-4" /> WhatsApp</a>
      </div>
      <p v-if="errorRecorrido" class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-900" role="alert">
        <span>{{ errorRecorrido }}</span>
        <button type="button" class="shrink-0 font-semibold text-blue-700" @click="cargarRecorrido">Reintentar</button>
      </p>

      <!-- Completa: la línea del día -->
      <section class="mt-4">
        <h2 class="text-[13px] font-semibold uppercase tracking-wide text-slate-500">Línea del día<template v-if="horas"> · {{ clock(horas.from) }}–{{ horas.to ? clock(horas.to) : 'fin' }}</template></h2>
        <p v-if="ubicacionViva" class="mt-1 inline-flex items-center gap-1 text-[13px] leading-4 text-slate-500">
          {{ formatTime(ubicacionViva.registrado_at) }} · ±{{ ubicacionViva.precision_m }} m<template v-if="ubicacionViva.bateria !== null"> · <BatteryMedium class="size-3.5" /> {{ ubicacionViva.bateria }} %</template>
        </p>
        <ol v-if="eventos.length" ref="filas" class="mt-2 divide-y divide-slate-100">
          <li v-for="(evento, index) in eventos" :key="index" :data-pista="pistaDeEvento(evento) >= 0 ? pistaDeEvento(evento) : undefined">
            <button
              type="button"
              class="flex h-12 w-full items-center gap-3 rounded-lg text-left"
              :class="[evento.lugar ? 'active:bg-slate-50' : 'cursor-default', pistaDeEvento(evento) >= 0 && pistaDeEvento(evento) === pistaActual && '-mx-2 bg-blue-50 px-2']"
              :disabled="!evento.lugar"
              :aria-current="pistaDeEvento(evento) >= 0 && pistaDeEvento(evento) === pistaActual ? 'true' : undefined"
              @click="tocarFila(evento)"
            >
              <span class="size-2 shrink-0 rounded-full" :class="evento.tipo === 'hueco' ? 'border border-dashed border-slate-400' : evento.tipo === 'parada' ? 'bg-slate-400' : 'bg-blue-600'" aria-hidden="true" />
              <span class="flex-1 text-[16px] leading-5" :class="evento.tipo === 'hueco' ? 'text-slate-400' : 'text-slate-900'">{{ evento.titulo }}</span>
              <span class="text-[13px] tabular-nums leading-4" :class="evento.tipo === 'hueco' ? 'text-slate-400' : 'text-slate-500'">{{ evento.detalle }}</span>
            </button>
          </li>
        </ol>
        <p v-else-if="!cargando && recorrido" class="mt-2 text-[13px] text-slate-500">Sin recorrido en este horario.</p>
        <ul v-else-if="cargando" class="mt-2 space-y-3" aria-busy="true">
          <li v-for="n in 4" :key="n" class="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </ul>
      </section>
    </EquipoGpsPanel>

    <p v-else-if="equipo" class="absolute inset-x-4 top-20 z-[600] rounded-xl bg-white p-4 text-[16px] text-slate-600 shadow">
      Ese gerente no está en tu equipo.
    </p>

    <EquipoGpsFiltroHoras
      v-if="gerente"
      :abierto="filtroAbierto"
      :dias="dias"
      :cargando-dias="cargandoDias"
      :fecha="fecha"
      :hoy="hoy"
      :recorrido="recorrido"
      :horas="horas"
      :color="colorDe(gerente)"
      @cerrar="filtroAbierto = false"
      @dia="elegirDia"
      @aplicar="aplicarHoras"
    />
  </div>
</template>
