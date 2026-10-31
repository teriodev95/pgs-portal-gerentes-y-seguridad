<script setup lang="ts">
// Panel inferior tipo Uber hecho con CSS y pointer events, sin librerías. Dos modos:
// - `niveles`: varias alturas (p. ej. mínima / media / completa) con `v-model:nivel`; el gesto cae al más
//   cercano y tocar el asa pasa al siguiente. Asa visible siempre.
// - sin `niveles`: asomado / abierto (`v-model:abierto`), y con `ajustado` la altura asomada es la del contenido.
// Respeta `prefers-reduced-motion`.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    abierto?: boolean
    asomado?: number
    expandido?: number
    ajustado?: boolean
    /** Fracciones de pantalla, de menor a mayor. */
    niveles?: number[]
    nivel?: number
  }>(),
  { abierto: false, asomado: 0.38, expandido: 0.85, ajustado: false, niveles: undefined, nivel: 0 }
)
const emit = defineEmits<{
  (e: 'update:abierto', value: boolean): void
  (e: 'update:nivel', value: number): void
  (e: 'altura', px: number): void
}>()

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
// Con `niveles` y `ajustado`, el nivel mínimo es exactamente el encabezado (nombre, estado y navegador).
const altoCabeza = ref(0)
const alturas = computed(() => {
  if (!props.niveles) return [altoAsomado.value, altoExpandido.value]
  const lista = props.niveles.map((f) => Math.round(alto.value * f))
  if (props.ajustado && altoCabeza.value) lista[0] = Math.min(lista[1] ?? lista[0], altoCabeza.value + 12)
  return lista
})
const minimo = computed(() => alturas.value[0])
const maximo = computed(() => alturas.value[alturas.value.length - 1])

function fijar(objetivo: number | boolean) {
  const indice = typeof objetivo === 'boolean' ? (objetivo ? alturas.value.length - 1 : 0) : objetivo
  altoActual.value = alturas.value[Math.min(alturas.value.length - 1, Math.max(0, indice))]
  // La altura real: quien está debajo (mapa, botones flotantes) se acomoda encima del panel.
  emit('altura', altoActual.value)
  if (props.niveles) {
    if (indice !== props.nivel) emit('update:nivel', indice)
  } else {
    const abierto = indice === alturas.value.length - 1
    if (abierto !== props.abierto) emit('update:abierto', abierto)
  }
}
const nivelActual = () => (props.niveles ? props.nivel : props.abierto ? 1 : 0)

function medirContenido() {
  altoCabeza.value = cabeza.value?.offsetHeight ?? 0
  altoContenido.value = altoCabeza.value + (contenido.value?.scrollHeight ?? 0) + 24
}

function medir() {
  alto.value = window.innerHeight
  medirContenido()
  fijar(nivelActual())
}

function iniciar(event: PointerEvent) {
  // Los controles del encabezado (navegador, chips, enlaces) reciben su propio toque: capturar el puntero aquí
  // les robaría el click. Sólo el asa y el espacio libre arrastran el panel.
  const objetivo = event.target as HTMLElement
  const interactivo = objetivo.closest('button, a, input, [role="slider"]')
  if (interactivo && !interactivo.hasAttribute('data-asa')) return
  arrastre.value = { y0: event.clientY, alto0: altoActual.value, movido: false }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function mover(event: PointerEvent) {
  if (!arrastre.value) return
  const delta = arrastre.value.y0 - event.clientY
  if (Math.abs(delta) > 4) arrastre.value.movido = true
  altoActual.value = Math.min(maximo.value, Math.max(minimo.value, arrastre.value.alto0 + delta))
}

function soltar() {
  if (!arrastre.value) return
  const movido = arrastre.value.movido
  arrastre.value = null
  if (!movido) return fijar((nivelActual() + 1) % alturas.value.length)
  // Al nivel más cercano a donde se soltó.
  let mejor = 0
  alturas.value.forEach((h, i) => {
    if (Math.abs(h - altoActual.value) < Math.abs(alturas.value[mejor] - altoActual.value)) mejor = i
  })
  fijar(mejor)
}

let observador: ResizeObserver | null = null
watch(() => props.abierto, (v) => !props.niveles && fijar(v))
watch(() => props.nivel, (v) => props.niveles && fijar(v))
onMounted(() => {
  medir()
  window.addEventListener('resize', medir)
  if (props.ajustado && 'ResizeObserver' in window) {
    observador = new ResizeObserver(() => {
      medirContenido()
      if (nivelActual() === 0 && !arrastre.value) void nextTick(() => fijar(0))
    })
    if (contenido.value) observador.observe(contenido.value)
    if (cabeza.value) observador.observe(cabeza.value)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', medir)
  observador?.disconnect()
})

const completo = computed(() => nivelActual() === alturas.value.length - 1)
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
      <!-- Asa visible: 40 × 4 px; tocarla pasa al siguiente nivel. -->
      <button
        type="button"
        data-asa
        class="mx-auto block h-1 w-10 rounded-full bg-slate-300"
        :aria-expanded="completo"
        aria-label="Cambiar la altura del panel"
      />
      <div class="pt-3">
        <slot name="encabezado" />
      </div>
    </div>
    <div class="min-h-0 flex-1 px-4" :class="completo ? 'overflow-y-auto pb-6' : 'overflow-hidden'">
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
