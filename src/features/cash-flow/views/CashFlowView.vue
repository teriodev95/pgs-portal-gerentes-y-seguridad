<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import SemaforoCard from '../components/SemaforoCard.vue'
import BarraConservacion from '../components/BarraConservacion.vue'
import EgresosLista from '../components/EgresosLista.vue'
import AgenciasLista from '../components/AgenciasLista.vue'
import { useCashFlow } from '../composables'

const router = useRouter()
const { flujo, barras, loading, gerencia, semana, anio, esSemanaActual, semanaAnterior, semanaSiguiente } =
  useCashFlow()
</script>

<template>
  <MainCT>
    <NavbarCT
      title="Flujo de efectivo"
      :subtitles="[gerencia.toUpperCase()]"
      show-back-button
      @back="router.back()"
    />

    <div class="space-y-3 px-4 pb-6 pt-2">
      <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-2 py-1.5">
        <button
          type="button"
          class="inline-flex size-8 items-center justify-center rounded-md text-gray-700 hover:bg-gray-50"
          :disabled="loading"
          @click="semanaAnterior"
        >
          <ChevronLeft class="size-4" :stroke-width="2" />
        </button>
        <p class="text-sm font-semibold text-gray-900">Semana {{ semana }} · {{ anio }}</p>
        <button
          type="button"
          class="inline-flex size-8 items-center justify-center rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-30"
          :disabled="loading || esSemanaActual"
          @click="semanaSiguiente"
        >
          <ChevronRight class="size-4" :stroke-width="2" />
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-20">
        <div class="size-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />
        <span class="text-xs font-medium text-gray-400">Cargando flujo...</span>
      </div>

      <p v-else-if="!flujo || !barras" class="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        Sin datos para esta semana.
      </p>

      <template v-else>
        <SemaforoCard :cubos="flujo.cubos" />
        <BarraConservacion :barras="barras" />
        <EgresosLista :egresos="flujo.egresos" />
        <AgenciasLista :cadenas="flujo.cadenas" />
      </template>
    </div>
  </MainCT>
</template>
