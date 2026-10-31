<script setup lang="ts">
// Panel inferior tipo Uber hecho con CSS y pointer events, sin librerías: dos posiciones (asomado ≈38 %,
// abierto ≈85 % de la pantalla) y un asa. Se arrastra desde el asa o desde el encabezado; el contenido
// abierto se desplaza con scroll normal. Respeta `prefers-reduced-motion`.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ abierto?: boolean; asomado?: number; expandido?: number }>(), {
  abierto: false,
  asomado: 0.38,
  expandido: 0.85
})
const emit = defineEmits<{ (e: 'update:abierto', value: boolean): void; (e: 'altura', px: number): void }>()

const alto = ref(window.innerHeight)
const arrastre = ref<{ y0: number; alto0: number; movido: boolean } | null>(null)
const altoActual = ref(0)

const altoAsomado = computed(() => Math.round(alto.value * props.asomado))
const altoExpandido = computed(() => Math.round(alto.value * props.expandido))

function fijar(abierto: boolean) {
  altoActual.value = abierto ? altoExpandido.value : altoAsomado.value
  emit('altura', altoAsomado.value)
  if (abierto !== props.abierto) emit('update:abierto', abierto)
}

function medir() {
  alto.value = window.innerHeight
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

watch(() => props.abierto, fijar)
onMounted(() => {
  medir()
  window.addEventListener('resize', medir)
})
onBeforeUnmount(() => window.removeEventListener('resize', medir))
</script>

<template>
  <section
    class="equipo-gps-panel fixed inset-x-0 bottom-0 z-[500] flex flex-col rounded-t-2xl bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.12)]"
    :class="{ 'is-dragging': arrastre }"
    :style="{ height: `${altoActual}px` }"
    aria-label="Detalle del gerente"
  >
    <div
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
    <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-6" :class="abierto ? '' : 'overflow-hidden'">
      <slot />
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
