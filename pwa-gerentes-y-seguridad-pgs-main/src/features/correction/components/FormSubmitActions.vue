<script setup lang="ts">
import LoadingIcon from '@/shared/components/icons/LoadingIcon.vue';

interface Props {
  actionType: string;
  isSubmitting: boolean;
  isFormValid: boolean;
}

interface Emits {
  (event: 'submit'): void;
  (event: 'cancel'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <div v-if="actionType" class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
    <button 
      type="submit" 
      class="btn w-full sm:w-auto" 
      :class="{
        'btn-primary': actionType === 'correct',
        'btn-red text-white': actionType === 'delete'
      }" 
      :disabled="isSubmitting || !isFormValid"
      @click="$emit('submit')"
    >
      <span v-if="isSubmitting" class="flex gap-2 justify-center">
        Procesando
        <LoadingIcon color="green" class="size-5" />
      </span>
      <span v-else>Enviar solicitud</span>
    </button>

    <button 
      type="button" 
      @click="$emit('cancel')" 
      class="btn btn-primary-outline w-full sm:w-auto"
      :disabled="isSubmitting"
    >
      Cancelar
    </button>
  </div>
</template>
