<script setup lang="ts">
// Components
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import AuthHeader from '../components/ui/AuthHeader.vue'

// Composables
import { useAuthLogin } from '../composables/useAuthLogin'

// Composables initialization
const {
  loginForm,
  isLoading,
  handleLogin
} = useAuthLogin()
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Logo and Welcome Text -->
    <AuthHeader />
    
    <!-- Login Form -->
    <form class="space-y-6" @submit.prevent="handleLogin">
      <!-- Username Field -->
      <div>
        <LabelForm for="username"/>
        <InputGeneric 
          id="username" 
          type="text" 
          v-model="loginForm.usuario" 
          placeholder="Ingrese su nombre de usuario"
          :disabled="isLoading"
          required
        />
      </div>

      <!-- Password Field -->
      <div>
        <LabelForm for="password"/>
        <InputGeneric 
          id="password" 
          v-model="loginForm.pin" 
          type="password" 
          placeholder="*****" 
          :disabled="isLoading"
          required
        />
      </div>
      
      <BtnComponent 
        type="submit" 
        variant="yellow" 
        full-width
        :loading="isLoading"
      >
        Iniciar sesión
      </BtnComponent>
    </form>
  </div>
</template>

<style>
/* Fix for autocomplete background color */
input:-webkit-autofill,
input:-webkit-autofill:focus {
  transition: background-color 600000s 0s, color 600000s 0s;
}

input[data-autocompleted] {
  background-color: transparent !important;
}
</style>