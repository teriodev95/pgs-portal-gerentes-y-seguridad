<script setup lang="ts">
import { useRouter } from 'vue-router'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import SemaforoCard from '../components/SemaforoCard.vue'
import BarraConservacion from '../components/BarraConservacion.vue'
import EgresosLista from '../components/EgresosLista.vue'
import AgenciasLista from '../components/AgenciasLista.vue'
import { useCashFlow } from '../composables'

const router = useRouter()
const { flujo, barras, loading, gerencia, semana, anio } = useCashFlow()
</script>

<template>
  <MainCT>
    <NavbarCT
      title="Flujo de efectivo"
      :subtitles="[gerencia.toUpperCase(), `Semana ${semana} · ${anio}`]"
      show-back-button
      @back="router.back()"
    />

    <div class="space-y-3 px-4 pb-6 pt-2">
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
