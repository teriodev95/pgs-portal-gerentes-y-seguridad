<script setup lang="ts">
import { ref } from 'vue'
import { Camera, Image, X, CheckCircle2 } from 'lucide-vue-next'

defineProps<{
  label: string
  description: string
  preview: string
}>()

const emit = defineEmits<{
  'photo:captured': [file: File]
  'photo:removed': []
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function openFileSelector(): void {
  fileInput.value?.click()
}

function handleFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('photo:captured', file)
  }
  input.value = ''
}

function handleRemove(): void {
  emit('photo:removed')
}
</script>

<template>
  <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all">
    <!-- Preview state -->
    <template v-if="preview">
      <div class="relative">
        <img
          :src="preview"
          :alt="label"
          class="h-36 w-full object-cover"
        >
        <!-- Overlay badge -->
        <div class="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1">
          <CheckCircle2 :size="12" :stroke-width="2.5" class="text-white" />
          <span class="text-[10px] font-semibold text-white">Listo</span>
        </div>
        <!-- Remove button -->
        <button
          type="button"
          class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          @click="handleRemove"
        >
          <X :size="14" :stroke-width="2.5" />
        </button>
      </div>
      <div class="px-3 py-2">
        <p class="text-xs font-medium text-slate-700">{{ label }}</p>
      </div>
    </template>

    <!-- Empty state -->
    <template v-else>
      <button
        type="button"
        class="flex w-full flex-col items-center gap-2 px-3 py-6 transition-colors hover:bg-slate-50"
        @click="openFileSelector"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
          <Camera :size="22" :stroke-width="1.8" class="text-blue-500" />
        </div>
        <div class="text-center">
          <p class="text-xs font-semibold text-slate-700">{{ label }}</p>
          <p class="mt-0.5 text-[10px] text-slate-400">{{ description }}</p>
        </div>
        <div class="flex items-center gap-1 text-[10px] text-slate-400">
          <Camera :size="10" class="text-slate-400" />
          <span>Cámara</span>
          <span class="mx-1">o</span>
          <Image :size="10" class="text-slate-400" />
          <span>Galería</span>
        </div>
      </button>
    </template>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    >
  </div>
</template>
