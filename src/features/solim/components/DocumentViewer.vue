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
  if (base64.startsWith('data:')) {
    return base64
  }
  return `data:image/jpeg;base64,${base64}`
}
</script>

<template>
  <div class="space-y-3">
    <div v-for="doc in documents" :key="doc.label" class="flex items-center justify-between py-2 border-b border-gray-100">
      <span class="font-medium text-sm text-gray-700">{{ doc.label }}:</span>
      
      <div v-if="doc.type === 'image' && doc.value" class="flex items-center space-x-2">
        <img 
          :src="getImageSrc(doc.value)" 
          :alt="doc.label"
          class="w-16 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
          @click="openImageModal(doc.value, doc.label)"
        />
        <Button 
          variant="outline" 
          size="sm"
          @click="openImageModal(doc.value, doc.label)"
        >
          Ver
        </Button>
      </div>
      
      <span v-else-if="doc.type === 'text'" class="text-sm text-gray-600">{{ doc.value || 'No disponible' }}</span>
      
      <span v-else class="text-sm text-gray-400">No disponible</span>
    </div>
  </div>

  <!-- Image Modal -->
  <Dialog :open="isImageDialogOpen" @update:open="(value) => value ? null : closeImageModal()">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-hidden">
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