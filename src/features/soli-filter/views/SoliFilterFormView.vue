<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { Loader } from 'lucide-vue-next'
import { toCurrency } from '@/shared/utils'
import { useSoliFilter } from '../composables/useSoliFilter'
import { PHOTO_CONFIGS_CLIENTE, PHOTO_CONFIGS_AVAL } from '../types/soliFilter.types'
import type { PhotoField } from '../types/soliFilter.types'

// Layout
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'

// Shared form components
import LabelForm from '@/shared/components/forms/LabelForm.vue'

// Feature components
import PhotoCaptureCard from '../components/PhotoCaptureCard.vue'
import SoliFilterResult from '../components/SoliFilterResult.vue'

const router = useRouter()

const {
  previews,
  photosCount,
  setPhoto,
  removePhoto,
  // Catalog
  catalogoLoading,
  niveles,
  plazos,
  montos,
  registroSeleccionado,
  // Credit fields
  nivel,
  plazo,
  monto,
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
      title="Solicitud de Filtrado"
      :subtitles="[`${agencia} · Semana ${semana} · ${anio}`]"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- ========== FORM STATE ========== -->
    <div v-if="viewState === 'form'" class="px-4 py-5 space-y-6">
      <!-- Documents Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-700">Documentos</h2>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            {{ photosCount }}/4
          </span>
        </div>

        <!-- Cliente -->
        <div class="space-y-2">
          <p class="text-xs font-medium text-slate-500 pl-0.5">Cliente</p>
          <div class="grid grid-cols-2 gap-2.5">
            <PhotoCaptureCard
              v-for="config in PHOTO_CONFIGS_CLIENTE"
              :key="config.field"
              :label="config.label"
              :description="config.description"
              :variant="config.variant"
              :preview="previews[config.field]"
              @photo:captured="handlePhotoCaptured(config.field, $event)"
              @photo:removed="removePhoto(config.field)"
            />
          </div>
        </div>

        <!-- Aval -->
        <div class="space-y-2">
          <p class="text-xs font-medium text-slate-500 pl-0.5">Aval</p>
          <div class="grid grid-cols-2 gap-2.5">
            <PhotoCaptureCard
              v-for="config in PHOTO_CONFIGS_AVAL"
              :key="config.field"
              :label="config.label"
              :description="config.description"
              :variant="config.variant"
              :preview="previews[config.field]"
              @photo:captured="handlePhotoCaptured(config.field, $event)"
              @photo:removed="removePhoto(config.field)"
            />
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-slate-100" />

      <!-- Credit Selection -->
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
          <select
            id="nivel"
            v-model="nivel"
            :disabled="catalogoLoading"
            class="select-field"
          >
            <option value="" disabled>Selecciona nivel</option>
            <option v-for="n in niveles" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <!-- Plazo -->
        <div class="space-y-2">
          <LabelForm for="plazo">Plazo</LabelForm>
          <select
            id="plazo"
            v-model.number="plazo"
            :disabled="!nivel"
            class="select-field"
          >
            <option :value="0" disabled>Selecciona plazo</option>
            <option v-for="p in plazos" :key="p" :value="p">{{ p }} semanas</option>
          </select>
        </div>

        <!-- Monto -->
        <div class="space-y-2">
          <LabelForm for="monto">Monto</LabelForm>
          <select
            id="monto"
            v-model.number="monto"
            :disabled="!plazo"
            class="select-field"
          >
            <option :value="0" disabled>Selecciona monto</option>
            <option v-for="m in montos" :key="m" :value="m">{{ toCurrency(m) }}</option>
          </select>
        </div>

        <!-- Resumen del crédito (auto-fill) -->
        <div
          v-if="registroSeleccionado"
          class="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2"
        >
          <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Resumen</p>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <span class="text-slate-400">ID Cargo</span>
            <span class="text-right font-medium text-slate-700">#{{ registroSeleccionado.id }}</span>
            <span class="text-slate-400">1er Pago</span>
            <span class="text-right font-medium text-slate-700">{{ toCurrency(registroSeleccionado.primer_pago) }}</span>
            <span class="text-slate-400">Tarifa semanal</span>
            <span class="text-right font-medium text-slate-700">{{ toCurrency(registroSeleccionado.tarifa_semanal) }}</span>
            <span class="text-slate-400">Cargo</span>
            <span class="text-right font-medium text-slate-700">{{ toCurrency(registroSeleccionado.cargo) }}</span>
            <span class="text-slate-400">Total a pagar</span>
            <span class="text-right font-semibold text-slate-800">{{ toCurrency(registroSeleccionado.total_pagar) }}</span>
          </div>
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
.select-field {
  @apply rounded-lg block w-full p-2.5 text-sm bg-white border border-slate-200 text-slate-800
    focus:ring-blue-500 focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed;
}

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
