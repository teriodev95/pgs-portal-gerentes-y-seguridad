<!-- components/AuthHeader.vue -->
<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  showLogo?: boolean
  logoAlt?: string
  logoSrc?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Portal Gerentes y Seguridad',
  subtitle: 'Inicie sesión para continuar',
  showLogo: true,
  logoAlt: 'Xpress Logo',
  logoSrc: '/xpress.png'
})
</script>

<template>
  <div class="space-y-4">
    <!-- Logo -->
    <figure v-if="showLogo" class="flex justify-center">
      <img 
        :src="logoSrc" 
        :alt="logoAlt" 
        class="w-32 h-auto"
      />
    </figure>

    <!-- Welcome Text -->
    <div class="space-y-1 text-center">
      <h2 class="text-xs text-[#083040]">Bienvenido a</h2>
      <h1 class="text-lg font-semibold !text-[#D9AC59]">{{ title }}</h1>
    </div>
    
    <h2 class="text-center text-xs text-[#083040]">{{ subtitle }}</h2>
  </div>
</template>