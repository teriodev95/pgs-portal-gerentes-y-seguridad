<script setup lang="ts">
// Hoja inferior con el día y las horas del recorrido, como el popover «🕐 Todo el día» de MOX (RouteHours),
// hecha con CSS y pointer events: una tira de días con datos y la tira de actividad del día (movimiento en el
// color de la persona, paradas en gris, huecos punteados) con dos asas, Desde y Hasta, de 15 en 15 minutos.
import { computed, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { clock, dayActivity, dayLabelCorto, formatDistance, formatTime, hourBounds, sliceDay } from '../equipo-gps.helpers'
import type { DiaConDatos, RangoHoras, RecorridoHoy } from '../equipo-gps.types'

const props = defineProps<{
  abierto: boolean
  dias: DiaConDatos[]
  cargandoDias: boolean
  fecha: string
  hoy: string
  recorrido: RecorridoHoy | null
  horas: RangoHoras | null
  color: string
}>()
const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'dia', fecha: string): void
  (e: 'aplicar', horas: RangoHoras | null): void
}>()

const bounds = computed(() => (props.recorrido ? hourBounds(props.recorrido) : null))
const actividad = computed(() => (props.recorrido ? dayActivity(props.recorrido) : []))

// Borrador local: las asas se mueven aquí y sólo «Aplicar» lo manda afuera.
const desde = ref(0)
const hasta = ref(0)
watch(
  () => [props.abierto, bounds.value, props.horas] as const,
  () => {
    if (!bounds.value) return
    desde.value = props.horas?.from ?? bounds.value.min
    hasta.value = props.horas?.to ?? bounds.value.max
  },
  { immediate: true }
)

const pct = (ms: number) =>
  bounds.value ? `${((Math.min(Math.max(ms, bounds.value.min), bounds.value.max) - bounds.value.min) / (bounds.value.max - bounds.value.min)) * 100}%` : '0%'

const borrador = computed<RangoHoras | null>(() => {
  if (!bounds.value) return null
  if (desde.value <= bounds.value.min && hasta.value >= bounds.value.max) return null
  return { from: desde.value, to: hasta.value >= bounds.value.max ? null : hasta.value }
})
const tramo = computed(() => (props.recorrido && borrador.value ? sliceDay(props.recorrido, borrador.value) : props.recorrido))
const resumen = computed(() => {
  const r = tramo.value
  if (!r || !r.resumen.puntos) return 'Sin ubicaciones en este horario.'
  return `${formatDistance(r.resumen.distancia_m)} · ${r.paradas.length} ${r.paradas.length === 1 ? 'parada' : 'paradas'}`
})
const rango = computed(() => {
  if (!bounds.value) return ''
  const a = desde.value <= bounds.value.min ? formatTime(bounds.value.start[2]) : clock(desde.value)
  const b = hasta.value >= bounds.value.max ? formatTime(bounds.value.end[2]) : clock(hasta.value)
  return `${a} – ${b}`
})

// Asas: arrastre con pointer events sobre la pista; 15 min por paso; área táctil de 44 px.
const pista = ref<HTMLElement>()
let asa: 'desde' | 'hasta' | null = null
function aMs(clientX: number) {
  const b = bounds.value
  const el = pista.value
  if (!b || !el) return 0
  const rect = el.getBoundingClientRect()
  const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  const crudo = b.min + t * (b.max - b.min)
  return Math.round(crudo / b.step) * b.step
}
function tomar(cual: 'desde' | 'hasta', e: PointerEvent) {
  asa = cual
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function arrastrar(e: PointerEvent) {
  if (!asa || !bounds.value) return
  const ms = aMs(e.clientX)
  if (asa === 'desde') desde.value = Math.min(ms, hasta.value - bounds.value.step)
  else hasta.value = Math.max(ms, desde.value + bounds.value.step)
}
function soltar() {
  asa = null
}
function paso(cual: 'desde' | 'hasta', dir: number) {
  if (!bounds.value) return
  const s = bounds.value.step * dir
  if (cual === 'desde') desde.value = Math.min(Math.max(bounds.value.min, desde.value + s), hasta.value - bounds.value.step)
  else hasta.value = Math.max(Math.min(bounds.value.max, hasta.value + s), desde.value + bounds.value.step)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="abierto" class="fixed inset-0 z-[700]" role="dialog" aria-modal="true" aria-label="Día y horas del recorrido">
      <button type="button" class="absolute inset-0 bg-slate-900/30" aria-label="Cerrar" @click="emit('cerrar')" />
      <section class="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[0_-8px_24px_rgba(15,23,42,0.16)]">
        <div class="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-300" aria-hidden="true" />
        <div class="flex items-center justify-between px-4 pt-3">
          <h2 class="text-[16px] font-semibold text-slate-900">Día y horas</h2>
          <button type="button" class="inline-flex size-10 items-center justify-center rounded-full text-slate-600 active:bg-slate-100" aria-label="Cerrar" @click="emit('cerrar')">
            <X class="size-5" />
          </button>
        </div>

        <!-- Día: sólo los que tienen datos -->
        <div class="mt-2 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Día">
          <span v-if="cargandoDias && !dias.length" class="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
          <button
            v-for="d in dias"
            :key="d.fecha"
            type="button"
            class="flex h-10 shrink-0 flex-col items-center justify-center rounded-xl px-3 text-[13px] leading-4"
            :class="d.fecha === fecha ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 active:bg-slate-200'"
            :aria-pressed="d.fecha === fecha"
            @click="emit('dia', d.fecha)"
          >
            <span class="font-semibold">{{ d.fecha === hoy ? 'Hoy' : dayLabelCorto(d.fecha) }}</span>
            <span class="tabular-nums" :class="d.fecha === fecha ? 'text-blue-100' : 'text-slate-500'">{{ formatDistance(d.distancia_m) }}</span>
          </button>
          <p v-if="!cargandoDias && !dias.length" class="text-[13px] text-slate-500">Sin días con datos en los últimos 30.</p>
        </div>

        <!-- Horas: tira de actividad con dos asas -->
        <div class="px-4 pt-4" :style="{ '--color': color }">
          <p class="text-[16px] font-semibold tabular-nums text-slate-900" aria-live="polite">{{ bounds ? rango : 'Sin recorrido este día' }}</p>
          <div v-if="bounds" ref="pista" class="relative mt-6 h-11 touch-none select-none" @pointermove="arrastrar" @pointerup="soltar" @pointercancel="soltar">
            <div class="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-slate-100">
              <span
                v-for="(b, i) in actividad"
                :key="i"
                class="absolute inset-y-0"
                :class="b.kind === 'move' ? 'bg-[var(--color)]' : b.kind === 'stop' ? 'bg-slate-400' : 'bg-[repeating-linear-gradient(90deg,#94a3b8_0_3px,transparent_3px_6px)]'"
                :style="{ left: pct(b.from), width: `max(2px, calc(${pct(b.to)} - ${pct(b.from)}))` }"
              />
              <span class="absolute inset-y-0 left-0 bg-white/70" :style="{ width: pct(desde) }" />
              <span class="absolute inset-y-0 right-0 bg-white/70" :style="{ left: pct(hasta) }" />
            </div>
            <button
              v-for="cual in ['desde', 'hasta'] as const"
              :key="cual"
              type="button"
              class="absolute top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none"
              :style="{ left: pct(cual === 'desde' ? desde : hasta) }"
              role="slider"
              :aria-label="cual === 'desde' ? 'Desde' : 'Hasta'"
              :aria-valuemin="bounds.min"
              :aria-valuemax="bounds.max"
              :aria-valuenow="cual === 'desde' ? desde : hasta"
              :aria-valuetext="clock(cual === 'desde' ? desde : hasta)"
              @pointerdown="tomar(cual, $event)"
              @keydown.left.prevent="paso(cual, -1)"
              @keydown.right.prevent="paso(cual, 1)"
            >
              <span class="mx-auto block size-6 rounded-full border-2 border-blue-600 bg-white shadow" />
            </button>
          </div>
          <div v-if="bounds" class="mt-1 flex justify-between text-[13px] tabular-nums text-slate-500">
            <span>{{ clock(bounds.min) }}</span><span>{{ clock(bounds.max) }}</span>
          </div>
          <p class="mt-3 text-[13px] text-slate-600" aria-live="polite">{{ resumen }}</p>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 px-4">
          <button type="button" class="h-11 rounded-xl border border-blue-600 text-[16px] font-semibold text-blue-700 active:bg-blue-50" :disabled="!horas && !borrador" @click="emit('aplicar', null)">
            Todo el día
          </button>
          <button type="button" class="h-11 rounded-xl bg-blue-600 text-[16px] font-semibold text-white active:bg-blue-700" @click="emit('aplicar', borrador)">
            Aplicar
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
