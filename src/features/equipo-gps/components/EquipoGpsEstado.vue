<script setup lang="ts">
import { computed } from 'vue'
import type { GerenteEquipo } from '../equipo-gps.types'
import { pointAge } from '../equipo-gps.helpers'

const props = defineProps<{ gerente: GerenteEquipo; now: number }>()

// Verde sólo con captura de hace ≤10 min (misma regla que MOX). Lo demás en gris, nunca rojo
// inferido: «sin señal» no prueba que la persona apagó nada (decisión 26-oct-2026).
const texto = computed(() => {
  const g = props.gerente
  switch (g.estado) {
    case 'activo':
    case 'sin_senal':
      return pointAge(g.ubicacion?.registrado_at, props.now)
    case 'sin_hoy':
      return 'Sin ubicación hoy'
    case 'fuera_horario':
      return 'Fuera de horario'
    case 'sin_app':
      return 'Sin la app de rastreo'
    case 'vacante':
      return 'Gerencia vacante'
    default:
      return ''
  }
})

const punto = computed(() => {
  switch (props.gerente.estado) {
    case 'activo':
      return 'bg-emerald-500'
    case 'sin_senal':
      return 'bg-white ring-2 ring-inset ring-slate-400'
    default:
      return 'bg-slate-200'
  }
})
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-xs text-slate-600">
    <span class="size-2.5 shrink-0 rounded-full" :class="punto" aria-hidden="true" />
    {{ texto }}
  </span>
</template>
