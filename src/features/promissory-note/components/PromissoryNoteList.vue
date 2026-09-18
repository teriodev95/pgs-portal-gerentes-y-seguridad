<script setup lang="ts">
/**
 * Lo que el gerente trae sin retornar, en dos montones: lo que le falta entregar
 * y lo que ya registro. Al abrir la app, ese corte responde de un vistazo la
 * unica pregunta que tiene: que me falta.
 *
 * El resumen de arriba reusa el bloque de tres columnas de Solim —etiqueta
 * chica, cifra grande, todo del mismo ancho— para que la cabecera se lea como
 * una tarjeta mas de la columna y no como texto suelto.
 */
import { CheckCircle2, ClipboardList, Inbox, Search } from 'lucide-vue-next'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import PromissoryNoteCard from './PromissoryNoteCard.vue'
import type { PagarePendiente } from '../types'
import type { GrupoAgencia } from '../composables/usePromissoryNote'

defineProps<{
  grupos: GrupoAgencia[]
  registrados: PagarePendiente[]
  porEntregarCount: number
  total: number
  loading: boolean
  /** La gerencia aun no llega; la lista vacia todavia no significa nada. */
  esperandoGerencia: boolean
  mostrarBuscador: boolean
  nuncaRecibio: boolean
  contarMismoNombre: (pagare: PagarePendiente) => number
}>()

const busqueda = defineModel<string>('busqueda', { default: '' })

const emit = defineEmits<{ selectPagare: [pagare: PagarePendiente] }>()

const MICRO = 'flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500'
</script>

<template>
  <section class="space-y-5 px-4 py-5">
    <div v-if="loading || esperandoGerencia" class="space-y-3">
      <LoadSkeleton :items="6" />
    </div>

    <!-- Lista vacia. Son dos situaciones distintas y se leen igual si se resuelven
         con el mismo texto: el gerente que ya retorno todo y el que nunca ha
         recibido un pagare. -->
    <div
      v-else-if="total === 0"
      class="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
    >
      <span class="rounded-full bg-slate-100 p-3.5">
        <Inbox class="size-6 text-slate-400" />
      </span>
      <p class="text-[15px] font-semibold text-slate-900">Sin pagarés por entregar</p>
      <p class="max-w-xs text-[13px] leading-relaxed text-slate-500">
        {{
          nuncaRecibio
            ? 'Oficina todavía no te ha entregado pagarés.'
            : 'Ya registraste todos los pagarés que traías.'
        }}
      </p>
    </div>

    <template v-else>
      <!-- Tres columnas del mismo ancho: la simetria es la que deja leer las
           cifras de un vistazo sin compararlas a ojo. -->
      <div class="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div class="flex gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-medium text-slate-500">Por entregar</p>
            <p class="mt-0.5 text-2xl font-semibold tabular-nums leading-none text-slate-900">
              {{ porEntregarCount }}
            </p>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-medium text-slate-500">Registrados</p>
            <p class="mt-0.5 text-2xl font-semibold tabular-nums leading-none text-emerald-700">
              {{ registrados.length }}
            </p>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-medium text-slate-500">En tu poder</p>
            <p class="mt-0.5 text-2xl font-semibold tabular-nums leading-none text-slate-900">
              {{ total }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="mostrarBuscador" class="relative">
        <Search
          class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="busqueda"
          type="search"
          placeholder="Cliente, folio o agencia"
          aria-label="Buscar pagaré por cliente, folio o agencia"
          class="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <!-- Agrupado por agencia: es la ruta con la que el gerente sale a campo. -->
      <div v-for="grupo in grupos" :key="grupo.agencia" class="space-y-2.5">
        <p :class="MICRO">
          <ClipboardList class="size-3.5" />
          Agencia {{ grupo.agencia }}
          <span class="text-slate-300">·</span>
          <span class="tabular-nums">{{ grupo.pagares.length }}</span>
        </p>

        <PromissoryNoteCard
          v-for="pagare in grupo.pagares"
          :key="pagare.id_sistemas"
          :pagare="pagare"
          :mismo-nombre="contarMismoNombre(pagare)"
          @click="emit('selectPagare', pagare)"
        />
      </div>

      <div v-if="registrados.length" class="space-y-2.5">
        <p :class="MICRO">
          <CheckCircle2 class="size-3.5 text-emerald-600" />
          Ya registrados
          <span class="text-slate-300">·</span>
          <span class="tabular-nums">{{ registrados.length }}</span>
        </p>

        <PromissoryNoteCard
          v-for="pagare in registrados"
          :key="pagare.id_sistemas"
          :pagare="pagare"
          :mismo-nombre="contarMismoNombre(pagare)"
          @click="emit('selectPagare', pagare)"
        />
      </div>

      <p
        v-if="busqueda.trim() && !grupos.length && !registrados.length"
        class="px-2 py-10 text-center text-[13px] text-slate-500"
      >
        Ningún pagaré coincide con “{{ busqueda.trim() }}”.
      </p>

      <p v-else-if="!grupos.length" class="px-2 py-10 text-center text-[13px] text-slate-500">
        Ya registraste todas tus entregas. Oficina las cierra al cotejar el talón.
      </p>
    </template>
  </section>
</template>
