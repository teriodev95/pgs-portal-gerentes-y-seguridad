<script setup lang="ts">
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import PromissoryNoteList from '../components/PromissoryNoteList.vue'
import PromissoryNoteDetail from '../components/PromissoryNoteDetail.vue'
import { usePromissoryNote } from '../composables/usePromissoryNote'

const {
  busqueda,
  closeDetail,
  contarMismoNombre,
  esperandoGerencia,
  gruposPorEntregar,
  handleOnBack,
  handleSelectPagare,
  handleUpdated,
  loading,
  mostrarBuscador,
  nuncaRecibio,
  porEntregar,
  registrados,
  selectedPagare,
  total
} = usePromissoryNote()
</script>

<template>
  <MainCT>
    <NavbarCT
      :title="selectedPagare ? 'Registrar entrega' : 'Pagarés por entregar'"
      :show-back-button="true"
      @back="handleOnBack"
    />

    <PromissoryNoteList
      v-if="!selectedPagare"
      v-model:busqueda="busqueda"
      :grupos="gruposPorEntregar"
      :registrados="registrados"
      :por-entregar-count="porEntregar.length"
      :total="total"
      :loading="loading"
      :esperando-gerencia="esperandoGerencia"
      :mostrar-buscador="mostrarBuscador"
      :nunca-recibio="nuncaRecibio"
      :contar-mismo-nombre="contarMismoNombre"
      @select-pagare="handleSelectPagare"
    />

    <PromissoryNoteDetail
      v-else
      :pagare="selectedPagare"
      :mismo-nombre="contarMismoNombre(selectedPagare)"
      @close="closeDetail"
      @updated="handleUpdated"
    />
  </MainCT>
</template>
