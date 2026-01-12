<script setup lang="ts">
import { onMounted } from 'vue'
import { ROUTE_NAME } from '@/router'
import NavbarTop from '@/shared/components/NavbarTop.vue'
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
  <main class="bg-slate-100">
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop :label="selectedPagare ? 'Detalle del Pagaré' : 'Pagarés'" @on-back="handleOnBack" />
    </div>

    <PromissoryNoteList
      v-if="!selectedPagare"
      :pagares="pagares"
      :loading="loading"
      @select-pagare="handleSelectPagare"
    />

    <PromissoryNoteDetail
      v-if="selectedPagare"
      :pagare="selectedPagare"
      @close="closeDetail"
      @updated="handleUpdated"
    />
  </main>
</template>
