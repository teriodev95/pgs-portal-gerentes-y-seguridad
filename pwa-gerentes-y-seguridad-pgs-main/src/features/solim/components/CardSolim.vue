<script setup lang="ts">
import type { Solicitud } from '@/features/solim/types';
import BtnComponent from '@/shared/components/BtnComponent.vue';
import { CircleDollarSign, WatchIcon } from 'lucide-vue-next';
import { toCurrency } from '@/shared/utils';

interface Props {
  solicitud: Solicitud;
}

interface Emits {
  (e: 'action:approve', id: string): void;
  (e: 'action:reject', id: string): void;
  (e: 'action:details', id: string): void;
}

defineProps<Props>();
defineEmits<Emits>();

</script>

<template>
  <div class="bg-white rounded-b-lg">
    <div class="rounded-t-lg bg-blue-700/90 text-white p-4">
      <h1 class="text-[16px]">{{ solicitud.informacionCliente.nombreCompleto }}</h1>
      <p class="text-sm">Tel: {{ solicitud.informacionCliente.telefono }}</p>
    </div>
  
    <section class="p-4 space-y-4">
      <div>
        <div class="flex items-center justify-start gap-2">
          <span class="border-r-2 border-blue-700 h-4"></span>
          <circle-dollar-sign class="size-4" />
        </div>
    
        <div class="flex gap-6">
          <div class="flex-1">
            <p class="font-300 text-gray-400">Monto solicitado</p>
            <p class="font-md-700 text-blue-800">{{ toCurrency(solicitud.detallesCredito.montoSolicitado) }}</p>
          </div>
          <div class="flex-1">
            <p class="font-300 text-gray-400">Total a pagar</p>
            <p class="font-md-700 text-blue-800">{{ toCurrency(solicitud.detallesCredito.totalAPagar) }}</p>
          </div>
        </div>
        
        <div class="flex gap-6">
          <div class="flex-1">
            <p class="font-300 text-gray-400">Plazo</p>
            <p class="font-md-700 text-blue-800">{{ solicitud.detallesCredito.plazo }}</p>
          </div>
          <div class="flex-1">
            <p class="font-300 text-gray-400">Pago semanal</p>
            <p class="font-md-700 text-blue-800">{{ toCurrency(solicitud.detallesCredito.primerPago) }}</p>
          </div>
        </div>
      </div>
      
      <div>
        <div class="flex items-center justify-start gap-2">
          <span class="border-r-2 border-blue-700 h-4"></span>
          <watch-icon class="size-4" />
        </div>
      
        <div class="flex gap-6">
          <div class="flex-1">
            <p class="font-300 text-gray-400">Dia de entrega</p>
            <p class="font-md-700 text-blue-800">{{ solicitud.detallesCredito.horarios.diaEntrega }}</p>
          </div>
          <div class="flex-1">
            <p class="font-300 text-gray-400">Dia de pago</p>
            <p class="font-md-700 text-blue-800">{{ solicitud.detallesCredito.horarios.diaPago }}</p>
          </div>
        </div>
      </div>
  
      <div>
        <BtnComponent @click="$emit('action:details', solicitud.id)" variant="primary" outline class="w-full">
          Ver detalles completos
        </BtnComponent>
  
        <div class="flex gap-2 mt-2">
          <BtnComponent @click="$emit('action:approve', solicitud.id)" variant="green" class="flex-1">
            Aprobar
          </BtnComponent>
          <BtnComponent @click="$emit('action:reject', solicitud.id)" variant="red" class="flex-1">
            Rechazar
          </BtnComponent>
        </div>
      </div>
    </section>
  </div>

</template>

<style scoped>

</style>