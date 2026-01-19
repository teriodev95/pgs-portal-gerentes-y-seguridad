<script setup lang="ts">
import { onMounted } from 'vue'
import { ROUTE_NAME } from '@/router'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import PromissoryNoteList from '../components/PromissoryNoteList.vue'
import PromissoryNoteDetail from '../components/PromissoryNoteDetail.vue'
import { usePromissoryNote } from '../composables/usePromissoryNote'

const {
  pagares,
  loading,
  selectedPagare,
  handleSelectPagare,
  closeDetail,
  loadPagares,
  handleUpdated,
  handleOnBack
} = usePromissoryNote()

onMounted(async () => {
  await loadPagares()
})
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      :title="selectedPagare ? 'Detalle del Pagaré' : 'Pagarés'"
      :show-back-button="true"
      @back="handleOnBack"
    />

    <!-- Promissory Notes List -->
    <PromissoryNoteList
      v-if="!selectedPagare"
      :pagares="pagares"
      :loading="loading"
      @select-pagare="handleSelectPagare"
    />

    <!-- Promissory Note Detail -->
    <PromissoryNoteDetail
      v-if="selectedPagare"
      :pagare="selectedPagare"
      @close="closeDetail"
      @updated="handleUpdated"
    />
  </MainCT>
</template>
