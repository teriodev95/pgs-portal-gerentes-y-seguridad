<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ROUTE_NAME } from '@/router'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import { useStore } from '@/shared/stores'
import { promissoryNoteService } from '../services/promissory-note.service'
import PromissoryNoteList from '../components/PromissoryNoteList.vue'
import PromissoryNoteDetail from '../components/PromissoryNoteDetail.vue'
import type { Pagare } from '../types'

const store = useStore()
const pagares = ref<Pagare[]>([])
const loading = ref(false)
const selectedPagare = ref<Pagare | null>(null)

const isDetailOpen = computed(() => selectedPagare.value !== null)

const handleSelectPagare = (pagare: Pagare) => {
  selectedPagare.value = pagare
}

const closeDetail = () => {
  selectedPagare.value = null
}

onMounted(async () => {
  if (!store.gerenciaSelected) {
    console.warn('No hay gerencia seleccionada')
    return
  }

  try {
    loading.value = true
    pagares.value = await promissoryNoteService.getPagaresByGerencia(store.gerenciaSelected)
    console.log('Pagarés obtenidos:', pagares.value)
  } catch (error) {
    console.error('Error al obtener pagarés:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main>
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Pagarés" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
    </div>

    <PromissoryNoteList :pagares="pagares" :loading="loading" @select-pagare="handleSelectPagare" />

    <PromissoryNoteDetail :is-open="isDetailOpen" :pagare="selectedPagare" @close="closeDetail" />
  </main>
</template>
