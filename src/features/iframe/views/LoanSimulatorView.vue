<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { computed } from 'vue';
import { ROUTE_NAME } from '@/router';
import { useRouter } from 'vue-router';
import NavbarCT from '@/shared/components/ui/NavbarCT.vue';
import MainCT from '@/shared/components/ui/MainCT.vue';

const $router = useRouter();

const url = computed(() => {
  return `https://cierres.xpress1.cc/simulador-credito`
})

function handleBack() {
  $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}

</script>

<template>
  <MainCT>
    <NavbarCT
      :title="'Simulador de créditos'"
      :show-back="true"
      @back="handleBack"
    />

    <section class="space-y-4 p-2">
      <iframe :src="url" frameborder="0" class="w-full min-h-screen" ></iframe>
    </section>
  </MainCT>
</template>