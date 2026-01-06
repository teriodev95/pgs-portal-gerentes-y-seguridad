<script setup lang="ts">
import CardContainer from '@/shared/components/CardContainer.vue'
import LoanInfoItem from './LoanInfoItem.vue'

interface DataItem {
  label: string
  value: string | number
  rightAligned?: boolean
  show?: boolean
}

interface Props {
  title: string
  items: DataItem[]
}

defineProps<Props>()
</script>

<template>
  <CardContainer :title="title">
    <ul class="space-y-2">
      <template v-for="item in items" :key="item.label">
        <LoanInfoItem 
          v-if="item.show !== false"
          :label="item.label"
          :value="item.value"
          :right-aligned="item.rightAligned"
        />
      </template>
    </ul>
  </CardContainer>
</template>