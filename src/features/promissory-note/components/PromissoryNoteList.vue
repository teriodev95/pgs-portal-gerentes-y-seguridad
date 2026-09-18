<script setup lang="ts">
/**
 * Lo que el gerente trae sin retornar, en dos montones: lo que le falta entregar
 * y lo que ya registro. Al abrir la app, ese corte responde de un vistazo la
 * unica pregunta que tiene: que me falta.
 */
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import SearchIcon from '@/shared/components/icons/SearchIcon.vue'
import CheckCircleIcon from '@/shared/components/icons/CheckCircleIcon.vue'
import BoxCloseOutline from '@/shared/components/icons/BoxCloseOutline.vue'
import PromissoryNoteCard from './PromissoryNoteCard.vue'
import type { PagarePendiente } from '../types'
import type { GrupoAgencia } from '../composables/usePromissoryNote'

defineProps<{
  grupos: GrupoAgencia[]
  registrados: PagarePendiente[]
  porEntregarCount: number
  total: number
  loading: boolean
  mostrarBuscador: boolean
  nuncaRecibio: boolean
  contarMismoNombre: (pagare: PagarePendiente) => number
}>()

const busqueda = defineModel<string>('busqueda', { default: '' })

const emit = defineEmits<{ selectPagare: [pagare: PagarePendiente] }>()
</script>

<template>
  <SectionContainer>
    <LoadSkeleton :items="6" v-if="loading" />

    <!-- Lista vacia. Son dos situaciones distintas y se leen igual si se resuelven
         con el mismo texto: el gerente que ya retorno todo y el que nunca ha
         recibido un pagare. -->
    <div v-else-if="total === 0" class="space-y-2 py-16 text-center">
      <BoxCloseOutline class="mx-auto h-10 w-10 text-gray-300" />
      <TextCT variant="title">Sin pagarés por entregar</TextCT>
      <TextCT variant="tertiary">
        {{
          nuncaRecibio
            ? 'Oficina todavía no te ha entregado pagarés.'
            : 'Ya registraste todos los pagarés que traías.'
        }}
      </TextCT>
    </div>

    <template v-else>
      <div class="space-y-3">
        <TextCT variant="tertiary">
          {{ porEntregarCount }} por entregar
          <template v-if="registrados.length"> · {{ registrados.length }} ya registrados</template>
        </TextCT>

        <div v-if="mostrarBuscador" class="relative">
          <SearchIcon
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="busqueda"
            type="search"
            placeholder="Cliente, folio o agencia"
            aria-label="Buscar pagaré por cliente, folio o agencia"
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      <!-- Agrupado por agencia: es la ruta con la que el gerente sale a campo. -->
      <div v-for="grupo in grupos" :key="grupo.agencia" class="space-y-2">
        <TextCT variant="label" class="uppercase tracking-wide">
          Agencia {{ grupo.agencia }}
        </TextCT>

        <PromissoryNoteCard
          v-for="pagare in grupo.pagares"
          :key="pagare.id_sistemas"
          :pagare="pagare"
          :mismo-nombre="contarMismoNombre(pagare)"
          @click="emit('selectPagare', pagare)"
        />
      </div>

      <div v-if="registrados.length" class="space-y-2 pt-2">
        <TextCT variant="label" class="flex items-center gap-1.5 uppercase tracking-wide">
          <CheckCircleIcon class="h-3.5 w-3.5 text-green-600" />
          Ya registrados
        </TextCT>

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
        class="py-8 text-center text-sm text-slate-500"
      >
        Ningún pagaré coincide con “{{ busqueda.trim() }}”.
      </p>

      <p v-else-if="!grupos.length" class="py-8 text-center text-sm text-slate-500">
        Ya registraste todas tus entregas. Oficina las cierra al cotejar el talón.
      </p>
    </template>
  </SectionContainer>
</template>
