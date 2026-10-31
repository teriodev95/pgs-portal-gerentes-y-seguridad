<script setup lang="ts">
// Una sola fila deslizable: primero el estado (Todos / Activos / Sin señal), después las sucursales
// permitidas con su punto de color. Los dos grupos se combinan. El elegido va en el azul de acción.
import { computed } from 'vue'
import { getSucursalColor, sucursalNombre } from '../equipo-gps.helpers'
import type { FiltroEquipo } from '../equipo-gps.types'

const props = defineProps<{
  filtro: FiltroEquipo
  sucursal: string | null
  conteos: { todos: number; activos: number; sinSenal: number }
  sucursales: { codigo: string; n: number }[]
  /** Chips blancos con sombra (flotando sobre el mapa) o grises (sobre fondo blanco). */
  flotante?: boolean
}>()
const emit = defineEmits<{ (e: 'update:filtro', v: FiltroEquipo): void; (e: 'update:sucursal', v: string | null): void }>()

const estados = computed<{ id: FiltroEquipo; texto: string; n: number }[]>(() => [
  { id: 'todos', texto: 'Todos', n: props.conteos.todos },
  { id: 'activos', texto: 'Activos', n: props.conteos.activos },
  { id: 'sin_senal', texto: 'Sin señal', n: props.conteos.sinSenal }
])

const base = computed(() =>
  props.flotante
    ? 'bg-white text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.14)] active:bg-slate-50'
    : 'bg-slate-100 text-slate-700 active:bg-slate-200'
)
const activo = 'bg-blue-600 text-white'

function elegirSucursal(codigo: string) {
  emit('update:sucursal', props.sucursal === codigo ? null : codigo)
}
</script>

<template>
  <!-- Al deslizar, el chip donde se detiene queda alineado al margen de 16 px (scroll-snap + scroll-padding). -->
  <div
    class="flex snap-x snap-proximity gap-2 overflow-x-auto px-4 py-1 [scroll-padding-inline:16px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    role="group"
    aria-label="Filtros"
  >
    <button
      v-for="e in estados"
      :key="e.id"
      type="button"
      class="inline-flex h-8 shrink-0 snap-start items-center gap-1 rounded-full px-3 text-[13px] font-medium transition-colors"
      :class="filtro === e.id ? activo : base"
      :aria-pressed="filtro === e.id"
      @click="emit('update:filtro', e.id)"
    >
      {{ e.texto }} <span class="tabular-nums" :class="filtro === e.id ? 'text-blue-100' : 'text-slate-500'">{{ e.n }}</span>
    </button>

    <template v-if="sucursales.length > 1">
      <span class="my-1.5 w-px shrink-0 bg-slate-300/70" aria-hidden="true" />
      <button
        v-for="s in sucursales"
        :key="s.codigo"
        type="button"
        class="inline-flex h-8 shrink-0 snap-start items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors"
        :class="sucursal === s.codigo ? activo : base"
        :aria-pressed="sucursal === s.codigo"
        @click="elegirSucursal(s.codigo)"
      >
        <span
          class="size-2 rounded-full ring-1 ring-white/80"
          :style="{ background: getSucursalColor(s.codigo) === '#cbd5e1' ? '#334155' : getSucursalColor(s.codigo) }"
          aria-hidden="true"
        />
        {{ sucursalNombre(s.codigo) }}
        <span class="tabular-nums" :class="sucursal === s.codigo ? 'text-blue-100' : 'text-slate-500'">{{ s.n }}</span>
      </button>
    </template>
  </div>
</template>
