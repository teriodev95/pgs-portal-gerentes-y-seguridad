<script setup lang="ts">
interface Props {
  label: string
  value: string
  icon?: any
}

defineProps<Props>()
</script>

<template>
  <article class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
    <!-- Accent Strip -->
    <div class="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600" aria-hidden="true" />

    <!-- Content -->
    <div class="px-5 py-4">
      <div class="flex items-start gap-4">
        <!-- Icon Container -->
        <div
          v-if="icon"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/70 text-blue-600 transition-transform group-hover:scale-105"
        >
          <component :is="icon" class="h-5 w-5" stroke-width="2.5" />
        </div>

        <!-- Text Content -->
        <div class="min-w-0 flex-1 space-y-1.5">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ label }}</p>
          <p class="text-[15px] font-semibold leading-snug text-slate-900">{{ value }}</p>
        </div>
      </div>
    </div>
  </article>
</template>
