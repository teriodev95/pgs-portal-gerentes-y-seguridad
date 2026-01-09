<script setup lang="ts">
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import type { Pagare } from '../types'
import PromissoryNoteCard from './PromissoryNoteCard.vue'

defineProps<{
  pagares: Pagare[]
  loading: boolean
}>()

const emit = defineEmits<{
  selectPagare: [pagare: Pagare]
}>()
</script>

<template>
  <div class="p-4">
    <LoadSkeleton :items="6" v-if="loading" class="text-center py-8" />

    <div v-else-if="pagares.length === 0" class="text-center py-8">
      <p class="text-gray-500">No se encontraron pagarés</p>
    </div>

    <div v-else>
      <p class="mb-4 text-sm text-gray-600">Total: {{ pagares.length }} pagarés</p>

      <div class="space-y-2">
        <PromissoryNoteCard
          v-for="pagare in pagares"
          :key="pagare.id_sistemas"
          :pagare="pagare"
          @click="emit('selectPagare', pagare)"
        />
      </div>
    </div>
  </div>
</template>
