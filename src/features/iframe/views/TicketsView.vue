<script setup lang="ts">
import { ROUTE_NAME } from '@/router';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import NavbarCT from '@/shared/components/ui/NavbarCT.vue';
import MainCT from '@/shared/components/ui/MainCT.vue';
import { XPRESS_ENDPOINTS } from '@/shared/config/endpoints';


const $router = useRouter();

const url = computed(() => {
  return XPRESS_ENDPOINTS.ticketsUrl
})

function handleBack() {
  $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <MainCT>
    <NavbarCT
      :title="'Mis Tickets'"
      :show-back="true"
      @back="handleBack"
    />

    <section class="space-y-4 p-2">
      <iframe :src="url" frameborder="0" class="w-full min-h-screen" ></iframe>
    </section>
  </MainCT>
</template>
