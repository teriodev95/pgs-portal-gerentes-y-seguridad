<script setup lang="ts">
import { computed } from 'vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import { toCurrency } from '@/shared/utils/currency'
import { formatToHumanDate } from '@/shared/utils/useDate'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import type { Pagare } from '../types'

const props = defineProps<{
  isOpen: boolean
  pagare: Pagare | null
}>()

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}

const semaforoColor = computed(() => {
  if (!props.pagare?.semaforo) return ''

  const colors: Record<string, string> = {
    ENTREGADO: 'bg-green-100 text-green-800',
    RETORNADO_NO_ENCONTRADO: 'bg-yellow-100 text-yellow-800',
    LIQ_ESPECIAL: 'bg-blue-100 text-blue-800',
    PERDIDO: 'bg-red-100 text-red-800',
    ARCHIVO: 'bg-gray-100 text-gray-800',
    JURIDICO: 'bg-purple-100 text-purple-800',
    DEMANDA: 'bg-orange-100 text-orange-800',
    EXPEDIENTE: 'bg-indigo-100 text-indigo-800',
    FINADO: 'bg-black text-white'
  }

  return colors[props.pagare.semaforo] || 'bg-gray-100 text-gray-800'
})
</script>

<template>
  <Dialog :open="isOpen" @update:open="(value) => (value ? null : handleClose())">
    <DialogContent class="rounded-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Detalles del Pagaré</DialogTitle>
      </DialogHeader>

      <div v-if="pagare" class="space-y-4">
        <!-- Cliente Info -->
        <CardContainer>
          <h3 class="font-semibold text-lg mb-3 text-gray-700">Información del Cliente</h3>
          <div class="space-y-2">
            <div>
              <p class="text-sm text-gray-500">Nombre</p>
              <p class="font-medium">{{ pagare.cliente_nombre }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Teléfono</p>
              <p class="font-medium">{{ pagare.cliente_telefono || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Domicilio</p>
              <p class="font-medium">{{ pagare.cliente_domicilio || 'N/A' }}</p>
            </div>
          </div>
        </CardContainer>

        <!-- Aval Info -->
        <CardContainer v-if="pagare.aval_nombre">
          <h3 class="font-semibold text-lg mb-3 text-gray-700">Información del Aval</h3>
          <div>
            <p class="text-sm text-gray-500">Nombre</p>
            <p class="font-medium">{{ pagare.aval_nombre }}</p>
          </div>
        </CardContainer>

        <!-- Préstamo Info -->
        <CardContainer>
          <h3 class="font-semibold text-lg mb-3 text-gray-700">Información del Préstamo</h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-sm text-gray-500">ID Préstamo</p>
              <p class="font-medium">{{ pagare.prestamo_id }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Folio</p>
              <p class="font-medium">{{ pagare.folio }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Monto Préstamo</p>
              <p class="font-medium text-blue-600">{{ toCurrency(pagare.monto_prestamo) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Cargo</p>
              <p class="font-medium">{{ toCurrency(pagare.cargo) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Total a Pagar</p>
              <p class="font-medium text-green-600">{{ toCurrency(pagare.total_a_pagar) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Pago Semanal</p>
              <p class="font-medium">{{ toCurrency(pagare.pago_semanal) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Plazo</p>
              <p class="font-medium">{{ pagare.plazo }}</p>
            </div>
          </div>
        </CardContainer>

        <!-- Ubicación -->
        <CardContainer>
          <h3 class="font-semibold text-lg mb-3 text-gray-700">Ubicación</h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-sm text-gray-500">Gerencia</p>
              <p class="font-medium">{{ pagare.gerencia }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Sucursal</p>
              <p class="font-medium">{{ pagare.sucursal }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Agencia</p>
              <p class="font-medium">{{ pagare.agencia }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Agente</p>
              <p class="font-medium">{{ pagare.nombre_agente }}</p>
            </div>
          </div>
        </CardContainer>

        <!-- Estado y Semáforo -->
        <CardContainer>
          <h3 class="font-semibold text-lg mb-3 text-gray-700">Estado</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <p class="text-sm text-gray-500">Entregado:</p>
              <span
                :class="
                  pagare.entregado ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'
                "
              >
                {{ pagare.entregado ? 'Sí' : 'No' }}
              </span>
            </div>

            <div v-if="pagare.semaforo" class="flex items-center gap-2">
              <p class="text-sm text-gray-500">Semáforo:</p>
              <span :class="`px-3 py-1 text-sm rounded-full ${semaforoColor}`">
                {{ pagare.semaforo }}
              </span>
            </div>

            <div v-if="pagare.marca_folio">
              <p class="text-sm text-gray-500">Marca Folio</p>
              <p class="font-medium">{{ pagare.marca_folio }}</p>
            </div>
          </div>
        </CardContainer>

        <!-- Fechas -->
        <CardContainer>
          <h3 class="font-semibold text-lg mb-3 text-gray-700">Fechas</h3>
          <div class="space-y-3">
            <div v-if="pagare.fecha_entrega_pagare">
              <p class="text-sm text-gray-500">Fecha Entrega Pagaré</p>
              <p class="font-medium">{{ formatToHumanDate(pagare.fecha_entrega_pagare, true) }}</p>
            </div>
            <div v-if="pagare.created_at">
              <p class="text-sm text-gray-500">Creado</p>
              <p class="font-medium">{{ formatToHumanDate(pagare.created_at, true) }}</p>
            </div>
          </div>
        </CardContainer>

        <!-- ID Sistemas -->
        <div class="text-center text-xs text-gray-400">ID Sistema: {{ pagare.id_sistemas }}</div>
      </div>
    </DialogContent>
  </Dialog>
</template>
