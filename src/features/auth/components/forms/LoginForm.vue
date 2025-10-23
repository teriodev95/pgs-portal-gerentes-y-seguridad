<!-- components/LoginForm.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import type { IAuthLogin } from '../../types';

import LabelForm from '@/shared/components/forms/LabelForm.vue';
import InputGeneric from '@/shared/components/forms/InputGeneric.vue';
import BtnComponent from '@/shared/components/BtnComponent.vue';

interface Props {
  loading?: boolean
  initialValues?: Partial<IAuthLogin>
}

interface Emits {
  (e: 'submit', data: IAuthLogin): void
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const form = ref<IAuthLogin>({
  username: "",
  password: ""
})

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Username Field -->
    <div>
      <LabelForm for="username">Ingrese su nombre de usuario</LabelForm>
      <InputGeneric 
        id="username" 
        type="text" 
        v-model="form.username" 
        placeholder="ABC.XYZ"
        :disabled="loading"
        required
      />
    </div>

    <!-- Password Field -->
    <div>
      <LabelForm for="password">Contraseña</LabelForm>
      <InputGeneric 
        id="password" 
        v-model="form.password" 
        type="password" 
        placeholder="*****" 
        :disabled="loading"
        required
      />
    </div>
    
    <BtnComponent 
      type="submit" 
      variant="yellow" 
      full-width
      :loading="loading"
    >
      Iniciar sesión
    </BtnComponent>
  </form>
</template>