<script setup lang="ts">
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import type { Pagare } from '../types'
import PromissoryNoteCard from './PromissoryNoteCard.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue';

defineProps<{
  pagares: Pagare[]
  loading: boolean
}>()

const emit = defineEmits<{
  selectPagare: [pagare: Pagare]
}>()
</script>

<template>
  <SectionContainer >
    <LoadSkeleton :items="6" v-if="loading" class="text-center" />

    <div v-else-if="pagares.length === 0" class="text-center">
      <p class="text-gray-500">No se encontraron pagarés</p>
    </div>

    <div class="space-y-2" v-else>
      <p class="text-sm text-gray-600">Total: {{ pagares.length }} pagarés</p>

      <div class="space-y-2">
        <PromissoryNoteCard
          v-for="pagare in pagares"
          :key="pagare.id_sistemas"
          :pagare="pagare"
          @click="emit('selectPagare', pagare)"
        />
      </div>
    </div>
  </SectionContainer>
</template>
