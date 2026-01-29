<script setup lang="ts">
import CardContainer from '@/shared/components/CardContainer.vue';
import DataField from '@/shared/components/DataField.vue';

interface Props {
  totalCount: number
  filteredCount: number
}

defineProps<Props>()
</script>

<template>
    <CardContainer >
      <div class="flex justify-between gap-2">
        <DataField label="Total de NO pagos:" :value="totalCount" />
        <DataField label="Filtrados:" :value="filteredCount" />
      </div>
    </CardContainer>
</template>