<script setup lang="ts">
/**
 * Paso 1: de donde sale la venta. Dos caminos, nada mas.
 * El camino recomendado lleva el conteo de solicitudes para que se note que hay trabajo ahi.
 */
import BankNotesIcon from '@/shared/components/icons/BankNotesIcon.vue'
import PlusIcon from '@/shared/components/icons/PlusIcon.vue'
import AngleRight from '@/shared/components/icons/AngleRight.vue'
import LoadingIcon from '@/shared/components/icons/LoadingIcon.vue'

interface Props {
  requestCount: number
  isLoading: boolean
  /** Sin gerencia activa no hay de donde leer las solicitudes; se dice, no se oculta. */
  hasGerencia: boolean
}

const props = defineProps<Props>()

interface Emits {
  (event: 'select', origin: 'request' | 'manual'): void
}

const emit = defineEmits<Emits>()

const hasRequests = () => props.hasGerencia && !props.isLoading && props.requestCount > 0
</script>

<template>
  <div class="space-y-3">
    <!-- Camino recomendado: los datos ya existen, solo hay que elegirlos -->
    <button
      type="button"
      :disabled="!hasRequests()"
      class="group flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all"
      :class="hasRequests()
        ? 'border-blue-600 bg-blue-50/60 hover:bg-blue-50 active:scale-[0.99]'
        : 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-70'"
      @click="emit('select', 'request')"
    >
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-full"
        :class="hasRequests() ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'"
      >
        <LoadingIcon v-if="isLoading" class="size-5 animate-spin" />
        <BankNotesIcon v-else class="size-5" />
      </span>

      <span class="min-w-0 flex-1">
        <span class="block font-semibold text-slate-900">Desde una solicitud aprobada</span>
        <span class="mt-0.5 block text-sm leading-5 text-slate-500">
          <template v-if="!hasGerencia">
            Elige primero una gerencia en el menú.
          </template>
          <template v-else-if="isLoading">Buscando solicitudes de la semana...</template>
          <template v-else-if="requestCount > 0">
            Con todos los vistos buenos. Los datos se llenan solos.
          </template>
          <template v-else>
            Esta semana esta gerencia no tiene solicitudes aprobadas sin venta.
          </template>
        </span>
      </span>

      <span v-if="hasGerencia && !isLoading && requestCount > 0"
        class="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
        {{ requestCount }}
      </span>
      <AngleRight v-if="hasRequests()" class="size-5 shrink-0 text-blue-600" />
    </button>

    <!-- Camino manual: siempre disponible, visualmente secundario -->
    <button
      type="button"
      class="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
      @click="emit('select', 'manual')"
    >
      <span class="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <PlusIcon class="size-5" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block font-semibold text-slate-900">Capturar a mano</span>
        <span class="mt-0.5 block text-sm leading-5 text-slate-500">
          Para ventas que no pasaron por la app.
        </span>
      </span>
      <AngleRight class="size-5 shrink-0 text-slate-400" />
    </button>
  </div>
</template>
