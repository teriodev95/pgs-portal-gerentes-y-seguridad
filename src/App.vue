<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { RouterView } from 'vue-router'
import { useStore } from './shared/stores'
import { useCsvLoaderStore } from './shared/stores'
import { onMounted } from 'vue'
import { initAccordions, initFlowbite } from 'flowbite'

import ConnectionAlert from './shared/components/ConnectionAlert.vue'
import PwaPrompt from './shared/components/ui/PwaPrompt.vue'
import DialogError from './shared/components/DialogError.vue'
import RevealCircle from './shared/components/RevealCircle.vue'

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
  <PwaPrompt />
  <DialogError />
  <RevealCircle />
  <RouterView />
</template>
