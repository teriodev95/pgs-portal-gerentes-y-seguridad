<script setup lang="ts">
import { compressImage } from '@/shared/utils/';
import { ref, computed } from 'vue';
import type { ExpenseFormData } from '@/features/expense/types';
import { watch } from 'vue';
import { commonService } from '@/shared/services/modules';

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import CameraIcon from '@/shared/components/icons/CameraIcon.vue';
import ImageFileIcon from '@/shared/components/icons/ImageFileIcon.vue';
import CheckCircleIcon from '@/shared/components/icons/CheckCircleIcon.vue';
import CloseIcon from '@/shared/components/icons/CloseIcon.vue';
import LoadingIcon from '@/shared/components/icons/LoadingIcon.vue';
import { fileToBase64 } from '@/shared/utils';

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */
interface Emits {
  (event: 'imageUrl', imageUrl: string): void;
}

interface Props {
  formData: ExpenseFormData;
  isDisabled: boolean;
  isImageCaptured: boolean;
  usuarioId: number;
}

const $emits = defineEmits<Emits>();
const $props = defineProps<Props>();

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */
const captureImageInput = ref<HTMLInputElement>();
const compressedFile = ref<File>();
const isImageCompressed = ref(false);
const isImageProcessed = computed(() => isImageCompressed.value && isImageUploaded.value);
const isImageUploaded = ref(false);
const isProcessingImage = ref(false); // Nuevo estado para indicar procesamiento
const progress = ref(0);
const imageBase64 = ref('');
const showImageDetails = ref(false);

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */

/**
 * handleFileUpload
 * @param event
 */
const handleFileUpload = async (event: Event) => {
  resetImageProcessingState();
  showImageDetails.value = true;
  isProcessingImage.value = true;
  progress.value = 0;

  const input = event.target as HTMLInputElement;

  if (input.files && input.files[0]) {
    const file = input.files[0];
    console.log(`Tamaño original: ${(file.size / 1024).toFixed(2)} KB`);

    try {
      // Comprimir la imagen
      compressedFile.value = await compressImage(file);
      imageBase64.value = await fileToBase64(compressedFile.value) as string;
      console.log(`Tamaño comprimido: ${(compressedFile.value.size / 1024).toFixed(2)} KB`);

      progress.value = 50;
      isImageCompressed.value = true;

      // Simular subida de la imagen
      const response = await commonService.uploadExpenseImage($props.formData.tipoGasto, $props.usuarioId, imageBase64.value);
      console.log('Respuesta de la subida de imagen:', response);
      progress.value = 100;
      isImageUploaded.value = true;
      $emits('imageUrl', response.data.imageUrl);
    } catch (error) {
      console.error('Error durante el proceso:', error);
      progress.value = 0; // Reiniciar progreso en caso de error
    } finally {
      isProcessingImage.value = false;
    }
  }
};

const resetImageProcessingState = () => {
  compressedFile.value = undefined;
  isImageCompressed.value = false;
  isImageUploaded.value = false;
  isProcessingImage.value = false;
  progress.value = 0;
};

watch(() => $props.isImageCaptured, (newValue) => {
  if (!newValue) {
    resetImageProcessingState();
    showImageDetails.value = false;
  }
});
</script>

<template>
  <div class="space-y-2">
    <input ref="captureImageInput" @change="event => handleFileUpload(event)" type="file" accept="image/jpeg"
      capture="environment" style="display: none" />

    <button type="button" @click="captureImageInput!.click()" :disabled="isDisabled"
      class="min-h-40 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 p-2 disabled:opacity-50">
      <CameraIcon class="size-6" />
      <p>{{ isImageCaptured ? 'Volver a tomar foto' : 'Tomar foto del ticket del gasto' }}</p>
      <p class="subtitle">Para asegurar el reembolso de tus gastos, es obligatorio adjuntar una foto del ticket y
        presentarlo físicamente
        al momento del cierre. Si no cumples con estos requisitos, no podremos procesar tu reembolso.</p>
    </button>

    <div v-if="showImageDetails" class="h-24 w-full rounded-lg border-2 p-2 space-y-2">
      <div class="flex justify-between items-center gap-4">
        <ImageFileIcon class="size-6" />

        <div class="flex-1 flex flex-col gap-1">
          <span>Ticket.png</span>
          <span v-if="compressedFile">{{ `${(compressedFile.size / 1024).toFixed(2)} KB` }}</span>
        </div>

        <!-- Iconos dinámicos -->
        <template v-if="isProcessingImage">
          <LoadingIcon class="size-6 text-blue-500" />
        </template>
        <template v-else>
          <CheckCircleIcon class="size-6 text-green-500" v-if="isImageProcessed" />
          <CloseIcon class="size-6 text-red-500" v-else />
        </template>
      </div>

      <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4 dark:bg-gray-700">
        <div class="bg-blue-600 h-1.5 rounded-full dark:bg-blue-500" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <div v-else class="h-24 w-full"></div>
  </div>
</template>
