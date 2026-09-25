<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Bell } from 'lucide-vue-next'
import { ROUTE_NAME } from '@/router/names'
import { useAvisos } from '../composables/useAvisos'

const REFRESH_MS = 2 * 60_000

const { noLeidos, fetchCount } = useAvisos()
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  fetchCount()
  timer = setInterval(fetchCount, REFRESH_MS)
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <RouterLink
    :to="{ name: ROUTE_NAME.AVISOS }"
    class="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200"
    :aria-label="noLeidos ? `Avisos, ${noLeidos} sin leer` : 'Avisos'"
  >
    <Bell class="size-6" />
    <span
      v-if="noLeidos"
      class="absolute right-0.5 top-0.5 min-w-[1.25rem] rounded-full bg-red-600 px-1 text-center text-[11px] font-bold leading-5 text-white ring-2 ring-slate-100"
    >
      {{ noLeidos > 99 ? '99+' : noLeidos }}
    </span>
  </RouterLink>
</template>
