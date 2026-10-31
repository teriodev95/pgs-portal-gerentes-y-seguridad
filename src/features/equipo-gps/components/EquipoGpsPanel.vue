<script setup lang="ts">
// Panel inferior tipo Uber hecho con CSS y pointer events, sin librerías: dos posiciones (asomado ≈38 %,
// abierto ≈85 % de la pantalla) y un asa. Se arrastra desde el asa o desde el encabezado; el contenido
// abierto se desplaza con scroll normal. Respeta `prefers-reduced-motion`.
// Con `ajustado`, la posición asomada es la altura de su propio contenido (nunca más que `expandido`): la
// ficha del mapa no deja huecos blancos debajo.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{ abierto?: boolean; asomado?: number; expandido?: number; ajustado?: boolean }>(),
  { abierto: false, asomado: 0.38, expandido: 0.85, ajustado: false }
)
const emit = defineEmits<{ (e: 'update:abierto', value: boolean): void; (e: 'altura', px: number): void }>()

const alto = ref(window.innerHeight)
const arrastre = ref<{ y0: number; alto0: number; movido: boolean } | null>(null)
const altoActual = ref(0)
const contenido = ref<HTMLElement>()
const cabeza = ref<HTMLElement>()
const altoContenido = ref(0)

const altoExpandido = computed(() => Math.round(alto.value * props.expandido))
const altoAsomado = computed(() => {
  const fraccion = Math.round(alto.value * props.asomado)
  if (!props.ajustado || !altoContenido.value) return fraccion
  return Math.min(altoExpandido.value, altoContenido.value)
})

function fijar(abierto: boolean) {
  altoActual.value = abierto ? altoExpandido.value : altoAsomado.value
  // La altura real: quien está debajo (mapa, botones flotantes) se acomoda encima del panel.
  emit('altura', altoActual.value)
  if (abierto !== props.abierto) emit('update:abierto', abierto)
}

function medirContenido() {
  // Asa + encabezado + contenido + respiro inferior (24 px) + área segura.
  const safe = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat-bottom') || '0') || 0
  altoContenido.value = (cabeza.value?.offsetHeight ?? 0) + (contenido.value?.scrollHeight ?? 0) + 24 + safe
}

function medir() {
  alto.value = window.innerHeight
  medirContenido()
  fijar(props.abierto)
}

function iniciar(event: PointerEvent) {
  arrastre.value = { y0: event.clientY, alto0: altoActual.value, movido: false }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function mover(event: PointerEvent) {
  if (!arrastre.value) return
  const delta = arrastre.value.y0 - event.clientY
  if (Math.abs(delta) > 4) arrastre.value.movido = true
  altoActual.value = Math.min(altoExpandido.value, Math.max(altoAsomado.value, arrastre.value.alto0 + delta))
}

function soltar() {
  if (!arrastre.value) return
  const medio = (altoAsomado.value + altoExpandido.value) / 2
  const abrir = arrastre.value.movido ? altoActual.value > medio : !props.abierto
  arrastre.value = null
  fijar(abrir)
}

let observador: ResizeObserver | null = null
watch(() => props.abierto, fijar)
onMounted(() => {
  medir()
  window.addEventListener('resize', medir)
  if (props.ajustado && 'ResizeObserver' in window) {
    observador = new ResizeObserver(() => {
      medirContenido()
      if (!props.abierto && !arrastre.value) void nextTick(() => fijar(false))
    })
    if (contenido.value) observador.observe(contenido.value)
    if (cabeza.value) observador.observe(cabeza.value)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', medir)
  observador?.disconnect()
})
</script>

<template>
  <section
    class="equipo-gps-panel fixed inset-x-0 bottom-0 z-[500] flex flex-col rounded-t-2xl bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.12)]"
    :class="{ 'is-dragging': arrastre }"
    :style="{ height: `${altoActual}px` }"
    aria-label="Detalle del gerente"
  >
    <div
      ref="cabeza"
      class="shrink-0 cursor-grab touch-none select-none px-4 pb-2 pt-2 active:cursor-grabbing"
      @pointerdown="iniciar"
      @pointermove="mover"
      @pointerup="soltar"
      @pointercancel="soltar"
    >
      <button
        type="button"
        class="mx-auto block h-1 w-10 rounded-full bg-slate-300"
        :aria-expanded="abierto"
        aria-label="Abrir o cerrar el panel"
        @click.stop="fijar(!abierto)"
      />
      <div class="pt-3">
        <slot name="encabezado" />
      </div>
    </div>
    <div class="min-h-0 flex-1 px-4" :class="abierto ? 'overflow-y-auto pb-6' : 'overflow-hidden'">
      <div ref="contenido" :class="ajustado ? 'pb-2' : ''">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.equipo-gps-panel {
  transition: height 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
  padding-bottom: env(safe-area-inset-bottom);
}
.equipo-gps-panel.is-dragging {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .equipo-gps-panel {
    transition: none;
  }
}
</style>
