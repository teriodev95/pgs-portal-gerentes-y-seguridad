<script setup lang="ts">
import FilterButton from '@/shared/components/FilterButton.vue'
import InputSearchFilter from '@/shared/components/forms/InputSearchFilter.vue'
import SearchIcon from '@/shared/components/icons/SearchIcon.vue'
import type { FilterOptions } from '@/shared/components/FilterButton.vue'
import type { ItemSearchFilter } from '@/shared/composables/useItemRenderer'

interface Props {
  title?: string
  placeholder?: string
  searchLabel?: string
  filterValue: string
  filterCheck: FilterOptions
  searchItems: any[]
}

interface Emits {
  (event: 'update:filterValue', value: string): void
  (event: 'update:filterCheck', value: FilterOptions): void
  (event: 'select-item', item: ItemSearchFilter): void
}

withDefaults(defineProps<Props>(), {
  title: 'Filtrar',
  placeholder: 'Ingresa el nombre',
  searchLabel: 'Buscar por nombre del cliente o aval'
})

const emit = defineEmits<Emits>()

function updateFilterValue(value: string) {
  emit('update:filterValue', value)
}

function updateFilterCheck(value: FilterOptions) {
  emit('update:filterCheck', value)
}

function handleSelectItem(item: ItemSearchFilter) {
  emit('select-item', item)
}
</script>

<template>
  <div class="rounded-lg border bg-white p-4 space-y-4">
    <h3 class="title">{{ title }}</h3>
    <div class="flex items-end justify-between gap-2">
      <InputSearchFilter 
        :icon="SearchIcon" 
        :items="searchItems" 
        @selectItem="handleSelectItem"
        item-type="cobranza" 
        id="name" 
        :label="searchLabel" 
        :placeholder="placeholder"
        :value="filterValue"
        @update:value="updateFilterValue"
      />

      <FilterButton 
        :model-value="filterCheck" 
        @update:modelValue="updateFilterCheck" 
      />
    </div>
  </div>
</template>