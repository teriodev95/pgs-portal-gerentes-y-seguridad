<script setup lang="ts">
import type { SaleDetails } from '../types'

// Components
import SalesItem from './SalesItem.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import BoxCloseOutline from '@/shared/components/icons/BoxCloseOutline.vue'

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
    <template v-if="hasSales">
      <SalesItem 
        v-for="sale in sales" 
        :key="`sale-${sale.id}`" 
        :sale="sale"
        @action:show-details="handleSaleSelect" 
      />
    </template>

    <LoadSkeleton v-else-if="isLoading" :items="6" class="mt-4" />

    <div v-else class="flex items-center justify-center">
      <div class="text-center text-gray-600">
        <BoxCloseOutline class="mx-auto h-28 w-28" />

        <div class="mt-2 text-center">
          <h2 class="text-2xl font-semibold">No se encontraron ventas</h2>
        </div>
      </div>
    </div>
  </section>
</template>