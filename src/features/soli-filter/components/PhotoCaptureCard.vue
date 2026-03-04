<script setup lang="ts">
import { ref, computed } from 'vue'
import { Camera, Image, X, CheckCircle2 } from 'lucide-vue-next'
import type { PhotoVariant } from '../types/soliFilter.types'

const props = withDefaults(defineProps<{
  label: string
  description: string
  preview: string
  variant?: PhotoVariant
}>(), {
  variant: 'blue',
})

const colors = computed(() => {
  if (props.variant === 'green') {
    return {
      iconBg: 'bg-emerald-50',
      iconText: 'text-emerald-500',
      border: 'border-emerald-100',
    }
  }
  return {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-500',
    border: 'border-slate-200',
  }
})

const emit = defineEmits<{
  'photo:captured': [file: File]
  'photo:removed': []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const showOptions = ref(false)

function toggleOptions(): void {
  showOptions.value = true
}

function selectCamera(): void {
  showOptions.value = false
  if (fileInput.value) {
    fileInput.value.setAttribute('capture', 'environment')
    fileInput.value.click()
  }
}

function selectGallery(): void {
  showOptions.value = false
  if (fileInput.value) {
    fileInput.value.removeAttribute('capture')
    fileInput.value.click()
  }
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
  <div :class="['relative overflow-hidden rounded-xl border bg-white transition-all', colors.border]">
    <!-- Preview state -->
    <template v-if="preview">
      <div class="relative">
        <img
          :src="preview"
          :alt="label"
          class="h-36 w-full object-cover"
        >
        <div class="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1">
          <CheckCircle2 :size="12" :stroke-width="2.5" class="text-white" />
          <span class="text-[10px] font-semibold text-white">Listo</span>
        </div>
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

    <!-- Option picker -->
    <template v-else-if="showOptions">
      <div class="flex w-full flex-col items-center gap-2 px-3 py-5">
        <p class="text-[11px] font-medium text-slate-500 mb-1">{{ label }}</p>
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 active:scale-[0.98]"
          @click="selectCamera"
        >
          <Camera :size="15" :stroke-width="1.8" class="text-slate-500" />
          Tomar foto
        </button>
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 active:scale-[0.98]"
          @click="selectGallery"
        >
          <Image :size="15" :stroke-width="1.8" class="text-slate-500" />
          Elegir de galería
        </button>
      </div>
    </template>

    <!-- Empty state -->
    <template v-else>
      <button
        type="button"
        class="flex w-full flex-col items-center gap-2 px-3 py-6 transition-colors hover:bg-slate-50"
        @click="toggleOptions"
      >
        <div :class="['flex h-12 w-12 items-center justify-center rounded-xl', colors.iconBg]">
          <Camera :size="22" :stroke-width="1.8" :class="colors.iconText" />
        </div>
        <div class="text-center">
          <p class="text-xs font-semibold text-slate-700">{{ label }}</p>
          <p class="mt-0.5 text-[10px] text-slate-400">{{ description }}</p>
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
