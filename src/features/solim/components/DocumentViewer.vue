<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  documents: Array<{ label: string; value: string; type: 'image' | 'text' }>
}

defineProps<Props>()

const selectedImage = ref<string | null>(null)
const selectedImageLabel = ref<string>('')
const isImageDialogOpen = ref(false)

const openImageModal = (image: string, label: string) => {
  selectedImage.value = image
  selectedImageLabel.value = label
  isImageDialogOpen.value = true
}

const closeImageModal = () => {
  selectedImage.value = null
  selectedImageLabel.value = ''
  isImageDialogOpen.value = false
}

const getImageSrc = (base64: string) => {
  if (base64.startsWith('http://') || base64.startsWith('https://')) {
    return base64
  }

  if (base64.startsWith('data:')) {
    return base64
  }
  return `data:image/jpeg;base64,${base64}`
}
</script>

<template>
  <div
    v-if="!documents.length"
    class="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400"
  >
    No hay documentos para mostrar.
  </div>

  <div v-else class="grid gap-4 md:grid-cols-2">
    <div
      v-for="doc in documents"
      :key="doc.label"
      class="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
    >
      <p class="mb-3 text-sm font-semibold text-slate-800">{{ doc.label }}</p>

      <div v-if="doc.type === 'image' && doc.value" class="space-y-3">
        <img
          :src="getImageSrc(doc.value)"
          :alt="doc.label"
          class="h-36 w-full rounded-2xl border border-slate-200 object-cover cursor-pointer transition hover:opacity-90"
          @click="openImageModal(doc.value, doc.label)"
        />
        <Button variant="outline" size="sm" class="w-full rounded-xl" @click="openImageModal(doc.value, doc.label)">
          Ver documento
        </Button>
      </div>

      <div
        v-else-if="doc.type === 'text'"
        class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
      >
        {{ doc.value || 'No disponible' }}
      </div>

      <div
        v-else
        class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400"
      >
        No disponible
      </div>
    </div>
  </div>

  <!-- Image Modal -->
  <Dialog :open="isImageDialogOpen" @update:open="(value) => value ? null : closeImageModal()">
    <DialogContent class="max-h-[90vh] max-w-3xl overflow-hidden rounded-[28px]">
      <DialogHeader>
        <DialogTitle>{{ selectedImageLabel }}</DialogTitle>
        <DialogDescription>
          Documento de identificación
        </DialogDescription>
      </DialogHeader>
      
      <div class="flex justify-center items-center max-h-[70vh] overflow-auto">
        <img 
          v-if="selectedImage"
          :src="getImageSrc(selectedImage)" 
          :alt="selectedImageLabel"
          class="max-w-full max-h-full object-contain rounded"
        />
      </div>
    </DialogContent>
  </Dialog>
</template>
