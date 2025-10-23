<script setup lang="ts">
// Interface - Props
interface Props {
  title?: string
  subtitle?: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  title: 'No hay datos que mostrar',
  subtitle: '',
  icon: ''
})
</script>

<template>
  <div class="mt-2">
    <div class="flex items-center justify-center">
      <div class="text-center text-gray-600">
        <!-- Custom icon slot -->
        <div v-if="icon" class="mx-auto mb-4">
          <component :is="icon" class="h-16 w-16 text-gray-400" />
        </div>

        <!-- Default empty icon if no icon provided -->
        <div v-else class="mx-auto mb-4">
          <svg class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div class="text-center">
          <h3 class="text-xl text-blue-900">{{ title }}</h3>
          <p v-if="subtitle" class="mt-2 text-sm text-gray-500">{{ subtitle }}</p>
        </div>
      </div>
    </div>
  </div>
</template>