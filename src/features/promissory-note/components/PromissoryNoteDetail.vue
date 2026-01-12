<script setup lang="ts">
import { toRef } from 'vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import { toCurrency } from '@/shared/utils/currency'
import type { Pagare } from '../types'
import DataField from '@/shared/components/DataField.vue'
import BadgetCT from '@/shared/components/ui/BadgetCT.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import { usePromissoryNoteDetail } from '../composables/usePromissoryNoteDetail'
import SectionContainer from '@/shared/components/SectionContainer.vue'

const props = defineProps<{
  pagare: Pagare | null
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const pagareRef = toRef(props, 'pagare')

const { formData, isSaving, parentescoOptions, save } = usePromissoryNoteDetail(pagareRef)

const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  await save(() => {
    emit('updated')
    emit('close')
  })
}
</script>

<template>
  <Transition name="fade" mode="out-in">
    <SectionContainer v-if="pagare">
      <!-- Cliente Info -->
      <CardContainer title="Información del Cliente">
        <DataField label="Nombre" :value="pagare.cliente_nombre" orientation="vertical" />
        <DataField label="Teléfono" :value="pagare.cliente_telefono || 'N/A'" orientation="vertical" />
        <DataField label="Domicilio" :value="pagare.cliente_domicilio || 'N/A'" orientation="vertical" />
      </CardContainer>

      <!-- Estado y Semáforo -->
      <CardContainer>
        <h3 class="font-semibold text-lg mb-3 text-gray-700">Estado</h3>
        <div class="flex justify-between items-center gap-2">
          <BadgetCT :value="pagare.semaforo as string" :variant="pagare.semaforo === 'ENTREGADO' ? 'green' : 'red'" />
          <DataField label="Marca Folio" :value="pagare.marca_folio || 'N/A'" orientation="vertical" />
        </div>
      </CardContainer>

      <!-- Préstamo Info -->
      <CardContainer title="Información del Préstamo">
        <div class="grid grid-cols-2 gap-2">
          <DataField label="ID Préstamo" :value="pagare.prestamo_id" orientation="vertical" />
          <DataField label="Folio" :value="pagare.folio" orientation="vertical" />
          <DataField label="Monto Préstamo" :value="toCurrency(pagare.monto_prestamo)" orientation="vertical" />
          <DataField label="Cargo" :value="toCurrency(pagare.cargo)" orientation="vertical" />
          <DataField label="Total a Pagar" :value="toCurrency(pagare.total_a_pagar)" orientation="vertical" />
          <DataField label="Pago semanal" :value="toCurrency(pagare.pago_semanal)" orientation="vertical" />
          <DataField label="Plazo" :value="pagare.plazo" orientation="vertical" />
        </div>
      </CardContainer>

      <!-- Ubicación -->
      <CardContainer>
        <h3 class="font-semibold text-lg mb-3 text-gray-700">Ubicación</h3>
        <div class="grid grid-cols-2 gap-2">
          <DataField label="Gerencia" :value="pagare.gerencia" orientation="vertical" />
          <DataField label="Sucursal" :value="pagare.sucursal" orientation="vertical" />
          <DataField label="Agencia" :value="pagare.agencia" orientation="vertical" />
          <DataField label="Agente" :value="pagare.nombre_agente" orientation="vertical" />
        </div>
      </CardContainer>

      <!-- Información de Entrega - EDITABLE -->
      <CardContainer>
        <h3 class="font-semibold text-lg mb-3 text-gray-700">Información de Entrega</h3>
        <div class="space-y-3">
          <div>
            <LabelForm for="lugar_entrega">
              Lugar de Entrega
            </LabelForm>
            <InputGeneric id="lugar_entrega" type="text" v-model="formData.lugar_entrega"
              placeholder="Ej: Domicilio del cliente" :is-required="false" />
          </div>

          <div>
            <LabelForm for="fecha_entrega">
              Fecha de Entrega
            </LabelForm>
            <InputGeneric id="fecha_entrega" type="date" v-model="formData.fecha_entrega_pagare" :is-required="false" />
          </div>

          <div>
            <LabelForm for="nombre_recibio">
              Nombre de quien recibió
            </LabelForm>
            <InputGeneric id="nombre_recibio" type="text" v-model="formData.nombre_quien_recibio"
              placeholder="Nombre completo" :is-required="false" />
          </div>

          <div>
            <LabelForm for="parentesco">
              Parentesco
            </LabelForm>
            <InputSelect id="parentesco" v-model="formData.parentesco_quien_recibio" :is-required="false">
              <option value="">Seleccione un parentesco</option>
              <option v-for="parentesco in parentescoOptions" :key="parentesco" :value="parentesco">
                {{ parentesco }}
              </option>
            </InputSelect>
          </div>

          <div>
            <LabelForm for="observaciones">
              Observaciones
            </LabelForm>
            <textarea id="observaciones" v-model="formData.observaciones" rows="3"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-[#083040] focus:ring-[#083040]"
              placeholder="Observaciones adicionales..." />
          </div>
        </div>
      </CardContainer>

      <!-- ID Sistemas -->
      <div class="text-center text-xs text-gray-400">ID Sistema: {{ pagare.id_sistemas }}</div>

      <!-- Botones de Acción -->
      <div class="flex flex-col md:flex-row gap-2 w-full pt-4">
        <BtnComponent :disabled="isSaving" @click="handleSave" class="flex-1">
          {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
        </BtnComponent>

        <BtnComponent variant="primary" outline :disabled="isSaving" @click="handleClose" class="flex-1">
          Cancelar
        </BtnComponent>
      </div>
    </SectionContainer>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
