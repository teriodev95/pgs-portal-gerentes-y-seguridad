<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { ROUTE_NAME } from '@/router';
import { useStore } from '@/shared/stores';
import { computed } from 'vue';
import { getPreviousWeek } from '@/shared/utils';
import { useRouter } from 'vue-router';
import NavbarCT from '@/shared/components/ui/NavbarCT.vue';
import MainCT from '@/shared/components/ui/MainCT.vue';

const $store = useStore()
const $router = useRouter()

const previousWeek = computed(() => getPreviousWeek($store.currentDate.week, $store.currentDate.year))
const url = computed(() => {
  return `https://comi.xpress1.cc/agencia?anio=${$store.currentDate.year}&semana=${previousWeek.value}&agencia=${$store.agencySelected}`
})


function handleBack() {
  $router.push({ name: ROUTE_NAME.WEEKLY_CLOSE })
}
</script>

<template>
  <MainCT>
    <NavbarCT
      :title="`Detalles Sem ${previousWeek}`"
      :show-back="true"
      @back="handleBack"
    />

    <section class="space-y-4 p-2">
      <iframe :src="url" frameborder="0" class="w-full min-h-screen" ></iframe>
    </section>
  </MainCT>
</template>