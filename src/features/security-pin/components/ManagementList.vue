<script setup lang="ts">
import type { IGerencia } from '@/interfaces';
import CardContainer from '@/shared/components/CardContainer.vue';
import TextCT from '@/shared/components/ui/TextCT.vue';

interface Props {
  managementList: IGerencia[];
}

interface Emits {
  (e: 'selectManagement', id: string): void;
}

import { ArrowRight } from 'lucide-vue-next';

defineProps<Props>();
defineEmits<Emits>();
</script>


<template>
  <template v-for="(item, index) in managementList" :key="`${item.gerencia}-${index}`" >
    <CardContainer @click="$emit('selectManagement', item.gerencia)">
      <div class="flex justify-between items-center gap-2">
        <TextCT variant="primary">{{ item.gerencia }}</TextCT>
        <TextCT variant="secondary">
          <ArrowRight class="size-4"/>
        </TextCT>
      </div>
    </CardContainer>
  </template>
</template>
