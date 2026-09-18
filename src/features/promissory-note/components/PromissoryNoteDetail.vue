<script setup lang="ts">
/**
 * La ficha con la que el gerente registra que ya entrego el pagare.
 *
 * Arriba el bloque de cotejo —los mismos datos que oficina compara contra el
 * talon— y abajo los cuatro campos que se llenan en la puerta del cliente. El
 * semaforo no aparece: esa decision es de oficina al recibir el talon de vuelta.
 */
import { toRef } from 'vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import PhoneIcon from '@/shared/components/icons/PhoneIcon.vue'
import {
  PARENTESCOS_FRECUENTES,
  PARENTESCOS_RESTANTES,
  usePromissoryNoteDetail
} from '../composables/usePromissoryNoteDetail'
import type { PagarePendiente } from '../types'

const props = defineProps<{ pagare: PagarePendiente | null }>()

const emit = defineEmits<{ close: []; updated: [] }>()

const pagareRef = toRef(props, 'pagare')

const {
  esActualizacion,
  formData,
  isSaving,
  puedeGuardar,
  save,
  verObservaciones,
  verTodosParentescos
} = usePromissoryNoteDetail(pagareRef)

const elegirParentesco = (valor: string) => {
  formData.value.parentesco_quien_recibio = valor
  verTodosParentescos.value = false
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
      <!-- Cotejo: antes de escribir nada, el gerente confirma que tiene en la mano
           el pagare de esta persona. Con 121 clientes que traen dos a la vez, el
           folio y el ID pesan tanto como el nombre. -->
      <CardContainer class-name="border-blue-200 bg-blue-50/60">
        <div class="space-y-1">
          <TextCT variant="label" class="uppercase tracking-wide text-blue-700">
            Coteja contra el pagaré
          </TextCT>
          <TextCT variant="title" class="text-lg">
            {{ pagare.cliente_nombre || 'Sin nombre' }}
          </TextCT>
        </div>

        <TextCT variant="secondary" v-if="pagare.cliente_domicilio">
          {{ pagare.cliente_domicilio }}
        </TextCT>

        <a
          v-if="pagare.cliente_telefono"
          :href="`tel:${pagare.cliente_telefono}`"
          class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#083040] ring-1 ring-blue-200"
        >
          <PhoneIcon class="h-4 w-4" />
          Llamar {{ pagare.cliente_telefono }}
        </a>

        <div class="space-y-1 border-t border-blue-200 pt-3 text-xs text-gray-600">
          <p>
            Folio <span class="font-semibold">{{ pagare.folio || '--' }}</span>
            · Agencia <span class="font-semibold">{{ pagare.agencia || '--' }}</span>
            <template v-if="pagare.semana_liquidacion && pagare.anio_liquidacion">
              · Liquidó <span class="font-semibold">S{{ pagare.semana_liquidacion }}/{{ pagare.anio_liquidacion }}</span>
            </template>
          </p>
          <p>Pagaré {{ pagare.id_sistemas }}</p>
          <p v-if="pagare.folio_solicitud">Solicitud {{ pagare.folio_solicitud }}</p>
        </div>
      </CardContainer>

      <CardContainer>
        <div class="space-y-4">
          <div>
            <LabelForm for="nombre_recibio">¿Quién recibió el pagaré? *</LabelForm>
            <InputGeneric
              id="nombre_recibio"
              type="text"
              v-model="formData.nombre_quien_recibio"
              placeholder="Como viene en el talón"
            />
          </div>

          <!-- Tres botones resuelven casi todas las entregas; la lista completa
               solo se despliega cuando hace falta. -->
          <div>
            <LabelForm for="parentesco">Parentesco</LabelForm>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opcion in PARENTESCOS_FRECUENTES"
                :key="opcion"
                type="button"
                class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
                :class="
                  formData.parentesco_quien_recibio === opcion
                    ? 'border-[#083040] bg-[#083040] text-white'
                    : 'border-gray-300 bg-white text-gray-700'
                "
                @click="elegirParentesco(opcion)"
              >
                {{ opcion }}
              </button>

              <button
                type="button"
                class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
                :class="
                  verTodosParentescos
                    ? 'border-[#083040] bg-[#083040] text-white'
                    : 'border-gray-300 bg-white text-gray-700'
                "
                @click="verTodosParentescos = !verTodosParentescos"
              >
                Otro…
              </button>
            </div>

            <InputSelect
              v-if="verTodosParentescos"
              id="parentesco"
              class="mt-2"
              v-model="formData.parentesco_quien_recibio"
              :is-required="false"
            >
              <option value="">Seleccione un parentesco</option>
              <option v-for="opcion in PARENTESCOS_RESTANTES" :key="opcion" :value="opcion">
                {{ opcion }}
              </option>
            </InputSelect>
          </div>

          <div>
            <LabelForm for="fecha_entrega">Fecha de entrega</LabelForm>
            <InputGeneric
              id="fecha_entrega"
              type="date"
              v-model="formData.fecha_entrega_pagare"
              :is-required="false"
            />
          </div>

          <div>
            <button
              v-if="!verObservaciones"
              type="button"
              class="text-sm font-semibold text-[#083040]"
              @click="verObservaciones = true"
            >
              + Agregar observación
            </button>

            <template v-else>
              <LabelForm for="observaciones">Observaciones</LabelForm>
              <textarea
                id="observaciones"
                v-model="formData.observaciones"
                rows="3"
                class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-xs text-gray-900 focus:border-[#083040] focus:ring-[#083040]"
                placeholder="Cualquier detalle del talón que oficina deba conservar"
              />
            </template>
          </div>
        </div>
      </CardContainer>

      <TextCT variant="tertiary" class="text-center">
        Oficina cierra el pagaré cuando le regreses el talón.
      </TextCT>

      <div class="flex w-full flex-col gap-2 pt-2 md:flex-row">
        <BtnComponent :disabled="isSaving || !puedeGuardar" @click="handleSave" class="flex-1">
          {{
            isSaving
              ? 'Guardando...'
              : esActualizacion
                ? 'Actualizar entrega'
                : 'Registrar entrega'
          }}
        </BtnComponent>

        <BtnComponent
          variant="primary"
          outline
          :disabled="isSaving"
          @click="emit('close')"
          class="flex-1"
        >
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
