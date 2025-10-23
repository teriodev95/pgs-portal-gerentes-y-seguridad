<script setup lang="ts">
import { ref } from 'vue';
import useGeolocation from '@/shared/composables/useGeolocation';

// Components
import MapWidget from '@/shared/components/MapWidget.vue';

// Interface - Props - Emits
type VisitStatus =
  | 'Cte localizado'
  | 'Auditor presente'
  | 'Anomalia'
  | 'No pago / Moroso'
  | 'Fraude'
  | 'Pago concentrado'
  | 'Expediente'
  | 'Juridico'
  | 'Cliente liquidado'
  | 'Demanda';

interface StatusClass {
  bgClass: string;
  borderFocus: string;
  ringFocus: string;
  textClass: string;
}

interface Emits {
  (event: 'action:cancel-visit'): void;
  (event: 'action:create-visit', notes: string, visitStatus: VisitStatus): void;
  (event: 'action:close-bottom-sheet'): void;
}

const emit = defineEmits<Emits>();

// Services, Composables and Stores initialization
const {  userLocation, hasPermission } = useGeolocation();

// Constants
const TUTORIAL_URL = 'https://pub-95b140c7b707487e9fa1a4e8d7e85017.r2.dev/PERMISOS_UBICACION_PGS.mp4';
const statusStyleConfig: Record<VisitStatus, StatusClass> = {
  'Cte localizado': {
    bgClass: 'bg-yellow-200',
    textClass: 'text-black',
    borderFocus: 'focus:border-yellow-300',
    ringFocus: 'focus:ring-yellow-300'
  },
  'Auditor presente': {
    bgClass: 'bg-yellow-300',
    textClass: 'text-black',
    borderFocus: 'focus:border-yellow-400',
    ringFocus: 'focus:ring-yellow-400'
  },
  'Anomalia': {
    bgClass: 'bg-red-200',
    textClass: 'text-black',
    borderFocus: 'focus:border-red-300',
    ringFocus: 'focus:ring-red-300'
  },
  'No pago / Moroso': {
    bgClass: 'bg-yellow-400',
    textClass: 'text-black',
    borderFocus: 'focus:border-yellow-500',
    ringFocus: 'focus:ring-yellow-500'
  },
  'Fraude': {
    bgClass: 'bg-red-400',
    textClass: 'text-black',
    borderFocus: 'focus:border-red-500',
    ringFocus: 'focus:ring-red-500'
  },
  'Pago concentrado': {
    bgClass: 'bg-orange-200',
    textClass: 'text-black',
    borderFocus: 'focus:border-orange-300',
    ringFocus: 'focus:ring-orange-300'
  },
  'Expediente': {
    bgClass: 'bg-purple-200',
    textClass: 'text-black',
    borderFocus: 'focus:border-purple-300',
    ringFocus: 'focus:ring-purple-300'
  },
  'Juridico': {
    bgClass: 'bg-sky-200',
    textClass: 'text-black',
    borderFocus: 'focus:border-sky-300',
    ringFocus: 'focus:ring-sky-300'
  },
  'Cliente liquidado': {
    bgClass: 'bg-stone-200',
    textClass: 'text-black',
    borderFocus: 'focus:border-stone-300',
    ringFocus: 'focus:ring-stone-300'
  },
  'Demanda': {
    bgClass: 'bg-blue-200',
    textClass: 'text-black',
    borderFocus: 'focus:border-blue-300',
    ringFocus: 'focus:ring-blue-300'
  }
};

// State definitions
const notes = ref<string>('');
const visitStatus = ref<VisitStatus>('Cte localizado');

// Methods
const cancelVisit = () => emit('action:cancel-visit');
const createVisit = () => emit('action:create-visit', notes.value, visitStatus.value);
const closeBottomSheet = () => emit('action:close-bottom-sheet');
</script>

<template>
  <section class="container-bottom-sheet-data">
    <!-- Location Error UI -->
    <div v-if="!hasPermission" class="h-full flex flex-col justify-between gap-4 px-4 pt-1 pb-4">
      <div class="flex-1 space-y-6">
        <h1 class="title">Permiso de Ubicación Requerido</h1>
        <p class="font-value">
          La función de ubicación está desactivada o el permiso no ha sido autorizado.
          Por favor, actívelo desde las configuraciones de su dispositivo.
          Si necesita ayuda, haga clic para ver un tutorial.
        </p>
      </div>

      <a :href="TUTORIAL_URL" @click="closeBottomSheet" class="btn-primary block" target="_blank">
        Ver tutorial
      </a>
    </div>

    <!-- Visit Form UI -->
    <div v-else class="h-full flex flex-col justify-between gap-4 px-4 pt-1 pb-4">
      <!-- Header -->
      <div>
        <h1 class="text-center text-lg font-bold text-blue-800">Datos de la visita</h1>
        <hr class="line" />
      </div>

      <!-- Status Selector -->
      <div class="font-300 flex items-center justify-between text-gray-400">
        Status
        <select v-model="visitStatus" id="visit-status"
          class="block rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:outline-none" :class="[
            statusStyleConfig[visitStatus].bgClass,
            statusStyleConfig[visitStatus].textClass,
            statusStyleConfig[visitStatus].borderFocus,
            statusStyleConfig[visitStatus].ringFocus
          ]">
          <option value="Cte localizado">CTE localizado</option>
          <option value="Auditor presente">Auditor presente en venta</option>
          <option value="Anomalia">Anomalia</option>
          <option value="No pago / Moroso">No pago / moroso</option>
          <option value="Fraude">Fraude</option>
          <option value="Pago concentrado">Pago concentrado</option>
          <option value="Expediente">Expediente</option>
          <option value="Juridico">Juridico</option>
          <option value="Cliente liquidado">Cliente liquidado</option>
          <option value="Demanda">Demanda</option>
        </select>
      </div>

      <!-- Map Display -->
      <div class="h-40 w-full">
        <MapWidget v-if="userLocation" :center="[userLocation.lat, userLocation.lng]" :marker="userLocation" readonly
          :zoom="16" class="z-20" />
      </div>

      <!-- Notes Textarea -->
      <div class="flex-1">
        <label for="notes" class="font-300 mb-2 block text-gray-400">Observaciones</label>
        <textarea id="notes" rows="8" v-model="notes"
          class="font-md-700 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-blue-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="Escribe tus observaciones"></textarea>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2 flex-none">
        <button class="btn btn-primary-outline mt-6 w-full" @click="cancelVisit">
          Cancelar
        </button>
        <button class="btn btn-primary mt-6 w-full" @click="createVisit">
          Registrar
        </button>
      </div>
    </div>
  </section>
</template>