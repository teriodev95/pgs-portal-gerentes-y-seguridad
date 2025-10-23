<script setup lang="ts">
import DetailItem from './DetailItem.vue'

interface DetailData {
  label: string
  value: string
}

interface Props {
  title: string
  items: DetailData[]
  titleClass?: string
}

withDefaults(defineProps<Props>(), {
  titleClass: 'text-lg font-semibold mb-3 text-blue-800'
})
</script>

<template>
  <div>
    <h3 :class="titleClass">{{ title }}</h3>
    <div class="space-y-3 text-sm">
      <DetailItem 
        v-for="item in items" 
        :key="item.label"
        :label="item.label" 
        :value="item.value" 
      />
    </div>
  </div>
</template>