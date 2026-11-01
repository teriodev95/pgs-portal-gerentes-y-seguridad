<script setup lang="ts">
// Navegador de paradas como las pistas de un reproductor: ‹ Parada 2 de 6 · 11:02 · 23 min ›.
// Flota sobre el mapa, arriba del panel; botones de 44 px; deshabilitado en la primera y la última.
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Pista } from '../equipo-gps.types'

const props = defineProps<{ pistas: Pista[]; indice: number | null }>()
const emit = defineEmits<{ (e: 'ir', indice: number): void; (e: 'centro'): void }>()

const actual = computed(() => (props.indice === null ? null : props.pistas[props.indice] ?? null))
// Sin selección, › arranca en Inicio y ‹ no tiene a dónde ir (restricción visible).
const primera = computed(() => props.indice === null || props.indice <= 0)
const ultima = computed(() => props.indice !== null && props.indice >= props.pistas.length - 1)

function mover(paso: number) {
  const desde = props.indice ?? (paso > 0 ? -1 : props.pistas.length)
  const destino = Math.min(props.pistas.length - 1, Math.max(0, desde + paso))
  emit('ir', destino)
}
</script>

<template>
  <div
    v-if="pistas.length"
    class="pointer-events-auto flex h-12 items-center rounded-xl bg-white shadow-[0_2px_8px_rgba(15,23,42,0.16)]"
    role="group"
    aria-label="Navegar por las paradas"
  >
    <button
      type="button"
      class="inline-flex size-12 shrink-0 items-center justify-center rounded-l-xl text-blue-600 disabled:text-slate-300"
      :disabled="primera"
      aria-label="Parada anterior"
      @click="mover(-1)"
    >
      <ChevronLeft class="size-6" />
    </button>
    <button
      type="button"
      class="flex h-12 min-w-0 flex-1 flex-col items-center justify-center px-1 text-center"
      aria-label="Ver esta parada en la línea del día"
      @click="emit('centro')"
    >
      <template v-if="actual">
        <span class="max-w-full truncate text-[13px] font-semibold leading-4 text-slate-900">{{ actual.titulo }}</span>
        <span class="max-w-full truncate text-[13px] leading-4 tabular-nums text-slate-500">{{ actual.detalle }}<span v-if="actual.nota" class="text-slate-400"> · {{ actual.nota }}</span></span>
      </template>
      <span v-else class="text-[13px] text-slate-500">{{ pistas.length - 2 }} {{ pistas.length - 2 === 1 ? 'parada' : 'paradas' }} · toca ‹ › para recorrerlas</span>
    </button>
    <button
      type="button"
      class="inline-flex size-12 shrink-0 items-center justify-center rounded-r-xl text-blue-600 disabled:text-slate-300"
      :disabled="ultima"
      aria-label="Parada siguiente"
      @click="mover(1)"
    >
      <ChevronRight class="size-6" />
    </button>
  </div>
</template>
