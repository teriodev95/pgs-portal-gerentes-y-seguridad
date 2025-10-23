<script setup lang="ts">
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
  <div class="mt-2 rounded-md border bg-white p-4">
    <h2 class="title">{{ title }}</h2>
    
    <ul class="mt-2 space-y-2">
      <template v-for="item in items" :key="item.label">
        <LoanInfoItem 
          v-if="item.show !== false"
          :label="item.label"
          :value="item.value"
          :right-aligned="item.rightAligned"
        />
      </template>
    </ul>
  </div>
</template>