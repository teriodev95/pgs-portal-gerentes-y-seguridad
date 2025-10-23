<script setup lang="ts">
import '@webzlodimir/vue-bottom-sheet/dist/style.css'
import { computed, ref } from 'vue'
import { STEPS } from '@/features/weekly-close/constants'
import { useCierreSemanal } from '@/features/weekly-close/composables/useCierreSemanal'
import { useFormValidation } from '@/features/weekly-close/composables/useFormValidation'
import { useSignStore } from '../stores'
import { useStepNavigation } from '@/features/weekly-close/composables/useStepNavigation'
import { useStore } from '@/shared/stores'
import { useSubmissionFlow } from '@/features/weekly-close/composables/useSubmissionFlow'
import { useWeeklyCloseErrorHandler } from '@/features/weekly-close/composables/useWeeklyCloseErrorHandler'
import { WEEKLY_CLOSE_ERROR_MESSAGES } from '@/features/weekly-close/constants/errorMessages'
import VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

// Components
import { securityPinService } from '@/features/security-pin/services/security.service'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import CommissionSummary from './CommissionSummary.vue'
import CardTitle from '@/shared/components/ui/CardTitle.vue'
import SlideUnlock from 'vue-slide-unlock'
import VerificationButton from './VerificationButton.vue'
import VerificationStep from './VerificationStep.vue'
import { useToast } from 'vue-toast-notification'
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'

interface Emit {
  (event: 'action:completed'): void
}

interface Form {
  agente: { firma: string; pin: string }
  gerente: { firma: string; pin: string }
  seguridad: { firma: string; pin: string }
}

const $emit = defineEmits<Emit>()
const signStore = useSignStore()
const globalStore = useStore()
const $toast = useToast()
const { handleSecurityError } = useWeeklyCloseErrorHandler()

// Composables
const { weeklyClose, agency, user, isAgencyVacant, isAgencyActive, saveWeeklyClose } = useCierreSemanal()
const { currentStep, goToStep } = useStepNavigation()

// Form data
const form = ref<Form>({
  agente: { firma: '', pin: '' },
  gerente: { firma: '', pin: '' },
  seguridad: { firma: '', pin: '' }
})

// Computed
const pinAgente = computed(() => weeklyClose.value?.pinAgente.toString() ?? '')
const pinGerente = computed(() => user.value?.pin?.toString() ?? '')

const {
  isAgentPasswordCorrect,
  isGerentPasswordCorrect,
  handleAgentPasswordResult,
  handleGerentPasswordResult,
} = useFormValidation()

const {
  isSendingData,
  showAnimation,
  verifyWeeklyClosing,
  vueSlideUnlockRef,
  handleCompletion
} = useSubmissionFlow(saveWeeklyClose, $emit)

// Store computed
const bottomSheetRef = ref<InstanceType<typeof VueBottomSheet>>()
const verificacionCompletadaAgente = computed(() => signStore.verificacionCompletadaAgente)
const verificacionCompletadaGerente = computed(() => signStore.verificacionCompletadaGerente)

const canSubmit = computed(() => {
  if (isAgencyVacant.value) return true
  return verificacionCompletadaAgente.value && verificacionCompletadaGerente.value
})

const handleOpen = () => {
  bottomSheetRef.value?.open()
}

const signAsSecurity = async () => {
  try {
    const { data: currentPin } = await securityPinService.checkPinExists(globalStore.gerenciaSelected as string)
    const firstPin = Object.values(currentPin.pins)[0] || { pin: '' }
    console.log('PIN de seguridad obtenido:', firstPin)

    if (!firstPin.pin || form.value.seguridad.pin !== firstPin.pin) {
      throw new Error(WEEKLY_CLOSE_ERROR_MESSAGES.INVALID_OR_EXPIRED_PIN)
    }
    
    signStore.verificacionCompletadaAgente = true
    bottomSheetRef.value?.close()
    goToStep(STEPS.HOME)
    $toast.success('PIN verificado correctamente. Puedes continuar con el proceso de cierre.')
  } catch (error) {
    handleSecurityError(error)
  }
}
</script>

<template>
  <main class="space-y-4">
    <!-- HOME -->
    <CardContainer v-if="currentStep === STEPS.HOME">
      <div class="space-y-8">
        <div class="space-y-2">
          <h1 class="title">
            {{
              isAgencyVacant
                ? 'Agencia Vacante'
                : 'Verificar agencia (opcional)'
            }}
          </h1>
          <h2 class="subtitle">
            {{
              isAgencyVacant
                ? 'La agencia se encuentra vacante, no es necesario verificar'
                : 'Solo si la agencia está vacante, omite el proceso de verificación.'
            }}
          </h2>
        </div>

        <div v-if="!isAgencyVacant" class="space-y-4">
          <VerificationButton v-if="isAgencyActive" user-type="agente" :is-completed="verificacionCompletadaAgente"
            :is-disabled="isSendingData" @click="goToStep(STEPS.AGENT_PIN_CAMERA)" />

          <VerificationButton user-type="gerente" :is-completed="verificacionCompletadaGerente"
            :is-disabled="isSendingData" @click="goToStep(STEPS.GERENT_PIN_CAMERA)" />
        </div>
      </div>
    </CardContainer>

    <CardContainer v-if="currentStep === STEPS.HOME">
      <CommissionSummary v-if="weeklyClose" :commissions="weeklyClose.egresosGerente" />

      <div class="flex items-center gap-2 pt-8">
        <input id="verifyWeeklyClosing" type="checkbox" v-model="verifyWeeklyClosing"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">

        <label for="verifyWeeklyClosing" class="ms-2 text-xs flex flex-col" :class="{ 'my-animation': showAnimation }">
          Confirmo el cierre para la agencia {{ agency?.agencia }} con las comisiones mostradas en esta pantalla.
          Desliza de izquierda a derecha para realizar el cierre.
        </label>
      </div>

      <div v-if="canSubmit" class="space-y-2 p-5">
        <slide-unlock ref="vueSlideUnlockRef" :auto-width="true" :circle="true" :disabled="isSendingData"
          :text="isSendingData ? 'Realizando Cierre' : 'Realizar Cierre'" success-text="Completado"
          @completed="handleCompletion" />
      </div>
    </CardContainer>
    <!-- / HOME -->

    <!-- AGENT_PIN_CAMERA  -->
    <template v-if="currentStep === STEPS.AGENT_PIN_CAMERA">
      <CardContainer>
        <VerificationStep user-type="agente" :user-name="`${signStore.nombreAgente}`" :correct-pin="pinAgente"
          :is-password-correct="isAgentPasswordCorrect" :is-verification-completed="verificacionCompletadaAgente"
          v-model:pin-value="form.agente.pin" @password-validation="handleAgentPasswordResult"
          @continue="goToStep(STEPS.HOME)" />
      </CardContainer>
      <CardContainer>
        <CardTitle title="Solicita un PIN temporal"
          subtitle="Si por algún motivo no pudiste realizar el cierre con tu agente, puedes solicitar un PIN genérico temporal para finalizar el proceso. Este PIN te lo proporcionará el encargado de seguridad de tu gerencia y solo será válido por un tiempo limitado." />
        <BtnComponent @click="handleOpen" class="w-full">
          Ingresar PIN
        </BtnComponent>
      </CardContainer>
    </template>
    <!-- / AGENT_PIN_CAMERA -->

    <!-- GERENT_PIN_CAMERA -->
    <CardContainer v-if="currentStep === STEPS.GERENT_PIN_CAMERA">
      <VerificationStep user-type="gerente" :user-name="`${signStore.nombreGerente}`" :correct-pin="pinGerente"
        :is-password-correct="isGerentPasswordCorrect" :is-verification-completed="verificacionCompletadaGerente"
        v-model:pin-value="form.gerente.pin" @password-validation="handleGerentPasswordResult"
        @continue="goToStep(STEPS.HOME)" />
    </CardContainer>
    <!-- / GERENT_PIN_CAMERA -->
  </main>

  <vue-bottom-sheet ref="bottomSheetRef" :max-width="1000" :max-height="1500">
    <div class="p-4 space-y-4 h-72">
      <CardTitle title="Ingresa el PIN temporal"
        subtitle="Introduce el PIN proporcionado por el encargado de seguridad." />

      <div class="space-y-2">
        <LabelForm for="security-pin">
          PIN Temporal de Seguridad
        </LabelForm>
        <InputGeneric id="security-pin" type="password" v-model="form.seguridad.pin"
          placeholder="Ingresa el PIN temporal" class="w-full" />
      </div>

      <BtnComponent @click="signAsSecurity" class="w-full">
        Confirmar PIN
      </BtnComponent>
      <!--
        <InputValidation :correctPin="$store.securityPin" v-model="form.seguridad.pin"
          @password-validation="handleSeguridadPasswordResult" label="PIN Seguridad" />
      -->
    </div>
  </vue-bottom-sheet>
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