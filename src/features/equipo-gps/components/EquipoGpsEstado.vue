<script setup lang="ts">
import { computed } from 'vue'
import type { GerenteEquipo } from '../equipo-gps.types'
import { agoShort, estadoTexto } from '../equipo-gps.helpers'

const props = withDefaults(defineProps<{ gerente: GerenteEquipo; now: number; chip?: boolean }>(), { chip: false })

// Verde sólo con captura de hace ≤10 min (misma regla que MOX). Lo demás en gris, nunca rojo
// inferido: «sin señal» no prueba que la persona apagó nada (decisión 26-oct-2026).
const texto = computed(() => {
  const g = props.gerente
  const base = estadoTexto(g.estado)
  if (g.estado === 'activo' || g.estado === 'sin_senal') {
    const hace = agoShort(g.ubicacion?.registrado_at, props.now)
    return hace ? `${base} · ${hace}` : base
  }
  return base
})

const punto = computed(() => {
  switch (props.gerente.estado) {
    case 'activo':
      return 'bg-emerald-500'
    case 'sin_senal':
      return 'bg-white ring-2 ring-inset ring-slate-400'
    case 'sin_app':
      return 'border-2 border-dotted border-slate-400 bg-transparent'
    default:
      return 'bg-slate-300'
  }
})
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] leading-4"
    :class="chip ? 'rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700' : 'text-slate-500'"
  >
    <span class="size-2 shrink-0 rounded-full" :class="punto" aria-hidden="true" />
    {{ texto }}
  </span>
</template>
