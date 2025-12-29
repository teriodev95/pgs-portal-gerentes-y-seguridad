<script setup lang="ts">
import { ROUTE_NAME } from '@/router'
import NavbarTop from '@/shared/components/NavbarTop.vue'
</script>

<template>
  <main class="relative min-h-screen bg-slate-100">

    <!-- Navigation Header -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Liquidación Especial" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" 
      />
    </div>

    <iframe
      src="https://ai.studio/apps/drive/13mrmWmJOMEmoUnqS3RgbrlYz2ERZMCOJ"
      class="w-full min-h-screen" frameborder="0">
    </iframe>
  </main>
</template>