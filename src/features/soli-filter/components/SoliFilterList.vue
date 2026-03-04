<script setup lang="ts">
import { computed } from 'vue'
import type { SoliFilterListItem } from '../types/soliFilter.types'

// Feature components
import SoliFilterItem from './SoliFilterItem.vue'
import SoliFilterEmpty from './SoliFilterEmpty.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'

const props = defineProps<{
  solicitudes: SoliFilterListItem[]
  isLoading: boolean
}>()

const hasSolicitudes = computed(() => props.solicitudes.length > 0)

defineEmits<{
  'solicitud:select': [solicitud: SoliFilterListItem]
}>()
</script>

<template>
  <section class="space-y-4 p-2">
    <!-- List -->
    <template v-if="hasSolicitudes">
      <SoliFilterItem
        v-for="solicitud in solicitudes"
        :key="`soli-${solicitud.id}`"
        :solicitud="solicitud"
        @action:show-details="$emit('solicitud:select', solicitud)"
      />
    </template>

    <!-- Loading -->
    <LoadSkeleton v-else-if="isLoading" :items="4" class="mt-4" />

    <!-- Empty (feature-specific) -->
    <SoliFilterEmpty v-else />
  </section>
</template>
