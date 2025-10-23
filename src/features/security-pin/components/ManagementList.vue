<script setup lang="ts">
import type { IGerencia } from '@/interfaces';
import CardContainer from '@/shared/components/CardContainer.vue';

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
  <template v-for="item in managementList" :key="item.id" >
    <CardContainer @click="$emit('selectManagement', item.gerencia)">
      <div class="flex justify-between items-center gap-2">
        <span class="font-medium">{{ item.gerencia }}</span>
        <ArrowRight class="size-4 text-slate-400"/>
      </div>
    </CardContainer>
  </template>
</template>
