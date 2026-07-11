<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useStore } from './shared/stores'
import { useCsvLoaderStore } from './shared/stores'
import { onMounted } from 'vue'
import { initAccordions, initFlowbite } from 'flowbite'

import ConnectionAlert from './shared/components/ConnectionAlert.vue'
import PwaPrompt from './shared/components/ui/PwaPrompt.vue'
import DialogError from './shared/components/DialogError.vue'
import RevealCircle from './shared/components/RevealCircle.vue'

const route = useRoute()
const $store = useStore()
const $csvLoaderStore = useCsvLoaderStore()
const isAuthRoute = computed(() => route.path.startsWith('/auth'))

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
  <PwaPrompt v-if="!isAuthRoute" />
  <DialogError />
  <RevealCircle />
  <RouterView />
</template>
