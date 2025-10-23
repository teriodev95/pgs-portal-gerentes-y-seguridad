<script setup lang="ts">
interface Props {
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Sin resultados',
  message: 'No se encontraron pagos con los filtros aplicados'
})
</script>

<template>
  <div class="flex min-h-[16rem] items-center justify-center">
    <div class="text-center text-gray-600">
      <div class="mt-2 text-center">
        <h2 class="text-2xl font-semibold">{{ title }}</h2>
        <p v-if="message" class="mt-2 text-gray-500">{{ message }}</p>
      </div>
    </div>
  </div>
</template>