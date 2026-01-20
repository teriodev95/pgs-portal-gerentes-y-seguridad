<script setup lang="ts">
import BtnComponent from '@/shared/components/BtnComponent.vue';
import { computed } from 'vue';

interface Props {
  actionType: string;
  isSubmitting: boolean;
  isFormValid: boolean;
}

interface Emits {
  (event: 'submit'): void;
  (event: 'cancel'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const submitButtonVariant = computed(() => {
  return props.actionType === 'delete' ? 'red' : 'primary';
});
</script>

<template>
  <div v-if="actionType" class="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
    <BtnComponent
      type="submit"
      :variant="submitButtonVariant"
      :disabled="isSubmitting || !isFormValid"
      :loading="isSubmitting"
      full-width
      class="sm:w-auto"
      @click="$emit('submit')"
    >
      <span v-if="!isSubmitting">Enviar solicitud</span>
    </BtnComponent>

    <BtnComponent
      type="button"
      variant="primary"
      outline
      :disabled="isSubmitting"
      full-width
      class="sm:w-auto"
      @click="$emit('cancel')"
    >
      Cancelar
    </BtnComponent>
  </div>
</template>
