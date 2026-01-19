<script setup lang="ts">
import type { SaleDetails } from '../types'

// Components
import SalesItem from './SalesItem.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'

// Interface - Props - Emits
defineProps<{
  sales: SaleDetails[]
  isLoading: boolean
  hasSales: boolean
}>()

const emit = defineEmits<{
  'sale:select': [sale: SaleDetails]
}>()

// Methods
function handleSaleSelect(sale: SaleDetails): void {
  emit('sale:select', sale)
}
</script>

<template>
  <section class="space-y-4 p-2">
    <!-- Sales List -->
    <template v-if="hasSales">
      <SalesItem
        v-for="sale in sales"
        :key="`sale-${sale.id}`"
        :sale="sale"
        @action:show-details="handleSaleSelect"
      />
    </template>

    <!-- Loading State -->
    <LoadSkeleton v-else-if="isLoading" :items="6" class="mt-4" />

    <!-- Empty State -->
    <EmptyCT
      v-else
      message="No se encontraron ventas"
      description="No hay ventas registradas en este momento."
    />
  </section>
</template>