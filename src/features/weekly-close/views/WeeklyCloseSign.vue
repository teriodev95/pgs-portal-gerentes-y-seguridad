<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref } from 'vue'
import { STEPS } from '@/features/weekly-close/constants'
import { useSignWeeklyClose } from '@/features/weekly-close/composables/useSignWeeklyClose'
import { useWeeklyClose } from '@/features/weekly-close/composables/useWeeklyClose'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'

// Components
import BtnComponent from '@/shared/components/BtnComponent.vue'
import CameraVideoCapture from '@/features/weekly-close/components/CameraVideoCapture.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import CardTitle from '@/shared/components/ui/CardTitle.vue'
import CommissionSummary from '@/features/weekly-close/components/CommissionSummary.vue'
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import InputValidation from '@/shared/components/forms/InputValidation.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import SlideUnlock from 'vue-slide-unlock'
import TextCT from '@/shared/components/ui/TextCT.vue'
import VerificationButton from '@/features/weekly-close/components/VerificationButton.vue'

// Composables
const {
  weeklyClose,
  agency,
  user,
  isAgencyVacant,
  isAgencyActive,
  saveWeeklyClose,
  isLoading,
  initializeWeeklyClose
} = useWeeklyClose()

const {
  // Estado del flujo
  currentStep,
  isSubmitting,

  // Validación de PIN
  agentPin,
  managerPin,
  securityPin,
  isAgentPinValid,
  isManagerPinValid,
  validateSecurityPin,

  // Verificaciones completadas
  isAgentVerificationCompleted,
  isManagerVerificationCompleted,
  canSubmit,
  canCloseWithoutSigning,

  // Confirmación y envío
  isWeeklyCloseConfirmed,
  showConfirmationAnimation,
  setWeeklyCloseConfirmation,
  handleSubmit,

  // Navegación entre pasos
  goToStep,

  // Completar verificación
  completeVerification,

  // Navegación
  navigateBackToWeeklyClose,

  // Reset
  resetSignFlow
} = useSignWeeklyClose()

// ============================================================================
// DATA
// ============================================================================
const isSecurityPinDrawerOpen = ref(false)
const vueSlideUnlockRef = ref()

// ============================================================================
// COMPUTED
// ============================================================================
const userNavbarTop = computed(() => user.value?.usuario || '')
const pinAgente = computed(() => weeklyClose.value?.pinAgente.toString() ?? '')
const pinGerente = computed(() => user.value?.pin?.toString() ?? '')
const nombreAgente = computed(() => weeklyClose.value?.resumenSemanal.agente ?? '')
const nombreGerente = computed(() => weeklyClose.value?.resumenSemanal.gerente ?? '')

const title = computed(() => {
  if (isAgencyVacant.value) {
    return 'Agencia Vacante - Verificación no requerida'
  }

  if (canCloseWithoutSigning.value) {
    return 'Usuario autorizado para cerrar sin firma'
  }

  return 'Verificar agencia'
})


// ============================================================================
// METHODS
// ============================================================================

/**
 * Maneja el resultado de validación del PIN del agente
 */
const handleAgentPasswordResult = (isCorrect: boolean) => {
  isAgentPinValid.value = isCorrect
}

/**
 * Maneja el resultado de validación del PIN del gerente
 */
const handleManagerPasswordResult = (isCorrect: boolean) => {
  isManagerPinValid.value = isCorrect
}

/**
 * Abre el drawer de PIN de seguridad
 */
const handleOpenSecurityModal = () => {
  isSecurityPinDrawerOpen.value = true
}

/**
 * Cierra el drawer de PIN de seguridad
 */
const closeSecurityPinDrawer = () => {
  isSecurityPinDrawerOpen.value = false
}

/**
 * Firma como seguridad con PIN temporal
 */
const signAsSecurity = async () => {
  const isValid = await validateSecurityPin(securityPin.value)

  if (isValid) {
    closeSecurityPinDrawer()
    goToStep(STEPS.HOME)
  }
}

/**
 * Maneja la navegación hacia atrás
 */
const handleOnBack = () => {
  if (currentStep.value !== STEPS.HOME) {
    goToStep(STEPS.HOME)
    return
  }

  navigateBackToWeeklyClose()
}

/**
 * Maneja el evento de completado del slide unlock
 */
const handleSlideUnlockCompletion = async () => {
  await handleSubmit(() => saveWeeklyClose(navigateBackToWeeklyClose))
  vueSlideUnlockRef.value?.reset()
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onBeforeMount(async () => {
  if (!weeklyClose.value && !isLoading.value) {
    await initializeWeeklyClose()
  }
})

onUnmounted(() => {
  resetSignFlow()
})
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT title="Verificación" :subtitle="userNavbarTop" :show-back-button="true" @back="handleOnBack" />

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center p-8">
      <TextCT>Cargando datos del cierre...</TextCT>
    </div>

    <!-- Error State -->
    <div v-else-if="!weeklyClose" class="flex flex-col items-center justify-center gap-4 p-8">
      <TextCT>No se encontraron datos del cierre semanal</TextCT>
      <BtnComponent @click="navigateBackToWeeklyClose">
        Regresar
      </BtnComponent>
    </div>

    <main v-else class="space-y-4 p-2">
      <!-- HOME - Paso inicial -->
      <template v-if="currentStep === STEPS.HOME">
        <CardContainer :title="title">
          <template v-if="canCloseWithoutSigning">
            <TextCT>
              Dado que tu usuario está autorizado para cerrar sin firma, puedes proceder directamente a realizar el cierre semanal sin necesidad de completar las verificaciones.
            </TextCT> 
          </template>
          
          <div v-else class="space-y-8">
            <TextCT>
              {{
                isAgencyVacant
                  ? 'La agencia se encuentra vacante, no es necesario verificar'
                  : 'Solo si la agencia está vacante, omite el proceso de verificación.'
              }}
            </TextCT>

            <div v-if="!isAgencyVacant" class="space-y-4">
              <VerificationButton v-if="isAgencyActive" user-type="agente" :is-completed="isAgentVerificationCompleted"
                :is-disabled="isSubmitting" @click="goToStep(STEPS.AGENT_PIN_CAMERA)" />

              <VerificationButton user-type="gerente" :is-completed="isManagerVerificationCompleted"
                :is-disabled="isSubmitting" @click="goToStep(STEPS.GERENT_PIN_CAMERA)" />
            </div>
          </div>
        </CardContainer>

        <CardContainer>
          <CommissionSummary v-if="weeklyClose" :commissions="weeklyClose.egresosGerente" />

          <div class="flex items-center gap-2 pt-8">
            <input id="verifyWeeklyClosing" type="checkbox" :checked="isWeeklyCloseConfirmed"
              @change="setWeeklyCloseConfirmation(($event.target as HTMLInputElement).checked)"
              class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500" />

            <label for="verifyWeeklyClosing" class="ms-2 flex flex-col text-xs"
              :class="{ 'my-animation': showConfirmationAnimation }">
              Confirmo el cierre para la agencia {{ agency?.agencia }} con las comisiones mostradas
              en esta pantalla. Desliza de izquierda a derecha para realizar el cierre.
            </label>
          </div>

          <div v-if="canSubmit" class="space-y-2 p-5">
            <slide-unlock ref="vueSlideUnlockRef" :auto-width="true" :circle="true" :disabled="isSubmitting"
              :text="isSubmitting ? 'Realizando Cierre' : 'Realizar Cierre'" success-text="Completado"
              @completed="handleSlideUnlockCompletion" />
          </div>
        </CardContainer>
      </template>

      <!-- AGENT_PIN_CAMERA - Verificación del agente -->
      <template v-if="currentStep === STEPS.AGENT_PIN_CAMERA">
        <CardContainer>
          <div class="space-y-8">
            <div class="space-y-6">
              <div class="space-y-2">
                <TextCT class="title">Proceso de verificación</TextCT>
                <TextCT>
                  Añade los métodos de validación para el usuario {{ nombreAgente }}: PIN,
                  reconocimiento facial y autenticación por voz.
                </TextCT>
              </div>

              <InputValidation :correctPin="pinAgente" @password-validation="handleAgentPasswordResult"
                label="PIN Agente" v-model="agentPin" />

              <CameraVideoCapture v-if="isAgentPinValid" mode="agente" />
            </div>

            <BtnComponent @click="completeVerification('agente')" full-width v-show="isAgentVerificationCompleted">
              Continuar
            </BtnComponent>
          </div>
        </CardContainer>

        <CardContainer>
          <CardTitle title="Solicita un PIN temporal"
            subtitle="Si por algún motivo no pudiste realizar el cierre con tu agente, puedes solicitar un PIN genérico temporal para finalizar el proceso. Este PIN te lo proporcionará el encargado de seguridad de tu gerencia y solo será válido por un tiempo limitado." />
          <BtnComponent @click="handleOpenSecurityModal" class="w-full">
            Ingresar PIN
          </BtnComponent>
        </CardContainer>
      </template>

      <!-- GERENT_PIN_CAMERA - Verificación del gerente -->
      <CardContainer v-if="currentStep === STEPS.GERENT_PIN_CAMERA">
        <div class="space-y-8">
          <div class="space-y-6">
            <div class="space-y-2">
              <TextCT class="title">Proceso de verificación</TextCT>
              <TextCT>
                Añade los métodos de validación para el usuario {{ nombreGerente }}: PIN,
                reconocimiento facial y autenticación por voz.
              </TextCT>
            </div>

            <InputValidation :correctPin="pinGerente" @password-validation="handleManagerPasswordResult"
              label="PIN Gerente" v-model="managerPin" />

            <CameraVideoCapture v-if="isManagerPinValid" mode="gerente" />
          </div>

          <BtnComponent @click="completeVerification('gerente')" full-width v-show="isManagerVerificationCompleted">
            Continuar
          </BtnComponent>
        </div>
      </CardContainer>
    </main>
  </MainCT>

  <!-- Drawer para PIN de seguridad -->
  <Drawer :open="isSecurityPinDrawerOpen" @update:open="(value: boolean) => value ? null : closeSecurityPinDrawer()">
    <DrawerContent>
      <div class="mx-auto w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>Ingresa el PIN temporal</DrawerTitle>
          <DrawerDescription>
            Introduce el PIN proporcionado por el encargado de seguridad.
          </DrawerDescription>
        </DrawerHeader>

        <div class="p-4 pb-6 space-y-4">
          <div class="space-y-2">
            <LabelForm for="security-pin"> PIN Temporal de Seguridad </LabelForm>
            <InputGeneric id="security-pin" type="password" v-model="securityPin" placeholder="Ingresa el PIN temporal"
              class="w-full" />
          </div>

          <BtnComponent @click="signAsSecurity" class="w-full"> Confirmar PIN </BtnComponent>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<style scoped>
.my-animation {
  animation: bounce 0.25s ease infinite alternate;
}

@keyframes bounce {
  0% {}

  100% {
    transform: translateY(-20px);
  }
}
</style>
