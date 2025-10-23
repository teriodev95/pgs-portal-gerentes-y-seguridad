<script setup lang="ts">
import { onBeforeMount
 } from 'vue'
import { RouterView } from 'vue-router'
import { useStore } from './shared/stores'
import { useCsvLoaderStore } from './shared/stores'
import ConnectionAlert from './shared/components/ConnectionAlert.vue'
import { onMounted } from 'vue'
import { initAccordions, initFlowbite } from 'flowbite'

const $store = useStore()
const $csvLoaderStore = useCsvLoaderStore()

onBeforeMount(async () => {
  $store.loadData()
  await $csvLoaderStore.loadCsvData()
})

onMounted(() => {
  initFlowbite();
  initAccordions();
})
</script>

<template>
  <ConnectionAlert />
  <RouterView />
</template>
