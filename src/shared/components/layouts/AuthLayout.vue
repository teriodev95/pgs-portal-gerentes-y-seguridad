<script lang="ts" setup>
import { RouterView, useRoute } from 'vue-router'
import { computed} from 'vue'
import { ROUTE_NAME } from '@/router';

interface Props {
  backgroundClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  backgroundClass: 'bg-slate-100'
})

const route = useRoute()

const backgroundClass = computed(() => {
  if (route.name === ROUTE_NAME.AUTH_PIN) {
    return 'bg-slate-800'
  }
  
  return props.backgroundClass
})
</script>

<template>
  <main>
    <section class="relative">
      <div 
        :class="[
          'mx-auto flex h-screen flex-col items-center justify-center px-6 py-8 lg:py-0',
          backgroundClass
        ]"
      >
        <div class="w-full dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div class="space-y-8 p-4 sm:p-8 md:space-y-6">
            <RouterView />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
