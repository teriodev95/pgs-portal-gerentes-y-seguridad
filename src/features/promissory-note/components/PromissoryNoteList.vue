<script setup lang="ts">
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import type { Pagare } from '../types'
import PromissoryNoteCard from './PromissoryNoteCard.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue';
import TextCT from '@/shared/components/ui/TextCT.vue';

defineProps<{
  pagares: Pagare[]
  loading: boolean
}>()

const emit = defineEmits<{
  selectPagare: [pagare: Pagare]
}>()
</script>

<template>
  <SectionContainer>
    <!-- Loading State -->
    <LoadSkeleton :items="6" v-if="loading" />

    <!-- Empty State -->
    <EmptyCT
      v-else-if="pagares.length === 0"
      message="No se encontraron pagarés"
      description="No hay pagarés registrados en este momento."
    />

    <!-- Promissory Notes List -->
    <div class="space-y-2" v-else>
      <TextCT variant="tertiary">Total: {{ pagares.length }} pagarés</TextCT>

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
