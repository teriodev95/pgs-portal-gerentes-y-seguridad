<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { Loader } from 'lucide-vue-next'
import { toCurrency } from '@/shared/utils'
import { useSoliFilter } from '../composables/useSoliFilter'
import { PHOTO_CONFIGS } from '../types/soliFilter.types'
import type { PhotoField } from '../types/soliFilter.types'

// Layout
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'

// Shared form components
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'

// Feature components
import PhotoCaptureCard from '../components/PhotoCaptureCard.vue'
import SoliFilterResult from '../components/SoliFilterResult.vue'

const router = useRouter()

const {
  previews,
  allPhotosReady,
  photosCount,
  setPhoto,
  removePhoto,
  // Credit
  nivel,
  plazo,
  monto,
  primerPago,
  availableAmounts,
  isAmountSelectDisabled,
  // Form
  tipoCredito,
  agencia,
  gerencia,
  semana,
  anio,
  viewState,
  response,
  isFormValid,
  submitSolicitud,
  retryPhoto,
  resetForm,
} = useSoliFilter()

function handlePhotoCaptured(field: PhotoField, file: File): void {
  setPhoto(field, file)
}

function handleBack(): void {
  router.push({ name: ROUTE_NAME.SOLI_FILTER })
}
</script>

<template>
  <MainCT>
    <NavbarCT
      title="Nueva Solicitud"
      :subtitles="[`${agencia} · Semana ${semana} · ${anio}`]"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- ========== FORM STATE ========== -->
    <div v-if="viewState === 'form'" class="px-4 py-5 space-y-6">
      <!-- Photos Section -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-slate-700">Documentos</h2>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            {{ photosCount }}/4
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <PhotoCaptureCard
            v-for="config in PHOTO_CONFIGS"
            :key="config.field"
            :label="config.label"
            :description="config.description"
            :preview="previews[config.field]"
            @photo:captured="handlePhotoCaptured(config.field, $event)"
            @photo:removed="removePhoto(config.field)"
          />
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-slate-100" />

      <!-- Credit Selection (cascading like Sales) -->
      <div class="space-y-4">
        <h2 class="text-sm font-semibold text-slate-700">Datos del crédito</h2>

        <!-- Tipo de crédito -->
        <div class="space-y-2">
          <LabelForm for="tipo-credito">Tipo de crédito</LabelForm>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              :class="[
                'flex h-10 items-center justify-center rounded-xl border text-xs font-semibold transition-all',
                tipoCredito === 'nuevo'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
              ]"
              @click="tipoCredito = 'nuevo'"
            >
              Nuevo
            </button>
            <button
              type="button"
              :class="[
                'flex h-10 items-center justify-center rounded-xl border text-xs font-semibold transition-all',
                tipoCredito === 'renovacion'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
              ]"
              @click="tipoCredito = 'renovacion'"
            >
              Renovación
            </button>
          </div>
        </div>

        <!-- Nivel -->
        <div class="space-y-2">
          <LabelForm for="nivel">Nivel</LabelForm>
          <InputSelect id="nivel" placeholder="Elige el Nivel" v-model="nivel">
            <option value="DIAMANTE">DIAMANTE</option>
            <option value="NUEVO">NUEVO</option>
            <option value="PREMIUM">PREMIUM</option>
            <option value="LEAL">LEAL</option>
            <option value="NOBEL">NOBEL</option>
            <option value="VIP">VIP</option>
          </InputSelect>
        </div>

        <!-- Plazo -->
        <div class="space-y-2">
          <LabelForm for="plazo">Plazo</LabelForm>
          <InputSelect id="plazo" placeholder="Elige el Plazo" v-model="plazo">
            <option value="16">16 semanas</option>
            <option value="21">21 semanas</option>
            <option value="26">26 semanas</option>
          </InputSelect>
        </div>

        <!-- Monto -->
        <div class="space-y-2">
          <LabelForm for="monto">Monto</LabelForm>
          <InputSelect
            id="monto"
            placeholder="Elige el Monto"
            v-model="monto"
            :is-disabled="isAmountSelectDisabled"
          >
            <option v-for="(amount, index) in availableAmounts" :key="`${amount}-${index}`" :value="amount">
              {{ toCurrency(Number(amount)) }}
            </option>
          </InputSelect>
        </div>

        <!-- Primer Pago (readonly) -->
        <div class="space-y-2">
          <LabelForm for="primer-pago">1er Pago</LabelForm>
          <InputSelect id="primer-pago" v-model="primerPago" :is-disabled="true">
            <option :value="primerPago">
              {{ toCurrency(Number(primerPago)) }}
            </option>
          </InputSelect>
        </div>
      </div>

      <!-- Context info -->
      <div class="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
        <p class="text-[11px] leading-relaxed text-slate-400">
          Gerencia: <span class="font-medium text-slate-600">{{ gerencia }}</span> ·
          Agencia: <span class="font-medium text-slate-600">{{ agencia }}</span> ·
          Semana: <span class="font-medium text-slate-600">{{ semana }}</span> ·
          Año: <span class="font-medium text-slate-600">{{ anio }}</span>
        </p>
      </div>

      <!-- Submit -->
      <button
        type="button"
        :disabled="!isFormValid"
        class="flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        @click="submitSolicitud"
      >
        Enviar solicitud
      </button>
    </div>

    <!-- ========== LOADING STATE ========== -->
    <div v-else-if="viewState === 'loading'" class="flex flex-col items-center px-8 py-20">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 mb-6">
        <Loader :size="28" :stroke-width="2" class="animate-spin text-blue-500" />
      </div>
      <h3 class="text-lg font-semibold text-slate-800">Revisando documentos...</h3>
      <p class="mt-2 text-sm text-slate-400 text-center max-w-[260px]">
        Estamos analizando las fotos. Esto puede tardar unos segundos.
      </p>
      <div class="w-full mt-8 h-1 rounded-full bg-slate-100 overflow-hidden max-w-xs">
        <div class="h-full rounded-full bg-blue-500 progress-bar" />
      </div>
    </div>

    <!-- ========== RESULT STATE ========== -->
    <div v-else-if="viewState === 'result' && response" class="px-4 py-5">
      <SoliFilterResult
        :response="response"
        @retry:photo="retryPhoto"
        @retry:all="resetForm"
      />
    </div>
  </MainCT>
</template>

<style scoped>
.progress-bar {
  animation: progress-indeterminate 1.8s ease-in-out infinite;
}

@keyframes progress-indeterminate {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 60%;
    margin-left: 20%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}
</style>
