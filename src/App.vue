<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { RouterView } from 'vue-router'
import { useStore } from './shared/stores'
import { useCsvLoaderStore } from './shared/stores'
import { onMounted } from 'vue'
import { initAccordions, initFlowbite } from 'flowbite'

import ConnectionAlert from './shared/components/ConnectionAlert.vue'
import InstallApp from './shared/components/ui/InstallApp.vue'

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
  <InstallApp />
  <RouterView />
</template>
