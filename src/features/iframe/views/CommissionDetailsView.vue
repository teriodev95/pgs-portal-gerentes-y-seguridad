<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { ROUTE_NAME } from '@/router';
import NavbarTop from '@/shared/components/NavbarTop.vue'
import { useStore } from '@/shared/stores';
import { computed } from 'vue';

const $store = useStore()
const url = computed(() => {
  return `https://comi.xpress1.cc/agencia?anio=${$store.currentDate.year}&semana=${$store.currentDate.week - 1}&agencia=${$store.agencySelected}`
})
</script>

<template>
  <main class="min-h-screen bg-slate-100">
    <div class="block p-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div class="sticky top-0 z-20 w-full bg-white p-2">
        <NavbarTop :label="`Detalles Sem ${$store.currentDate.week - 1}`" :back="{ name: ROUTE_NAME.WEEKLY_CLOSE }" />
      </div>
    </div>

    <section class="space-y-4 p-2">
      <iframe :src="url" frameborder="0" class="w-full min-h-screen" ></iframe>
    </section>
  </main>
</template>