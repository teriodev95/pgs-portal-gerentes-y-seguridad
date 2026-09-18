<script setup lang="ts">
/**
 * La ficha con la que el gerente registra que ya entrego el pagare.
 *
 * Dos bloques y nada mas: arriba lo que se coteja contra el papel, abajo lo que
 * se escribe en la puerta del cliente. El semaforo no aparece —esa decision es
 * de oficina al recibir el talon— y tampoco monto, aval ni plazo.
 */
import { toRef } from 'vue'
import { LoaderCircle, MapPin, Phone, ScanSearch, SquarePen, TriangleAlert } from 'lucide-vue-next'
import {
  PARENTESCOS_FRECUENTES,
  PARENTESCOS_RESTANTES,
  usePromissoryNoteDetail
} from '../composables/usePromissoryNoteDetail'
import type { PagarePendiente } from '../types'

const props = defineProps<{
  pagare: PagarePendiente | null
  /** Cuantos pagares hay a este nombre. El aviso pesa mas aqui que en la lista. */
  mismoNombre?: number
}>()

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

const MICRO =
  'flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500'
const CAMPO =
  'h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
const ETIQUETA = 'text-[13px] font-medium text-slate-600'

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
  <section v-if="pagare" class="space-y-5 px-4 py-5 pb-8">
    <!-- Cotejo: antes de escribir nada, el gerente confirma que tiene en la mano
         el pagare de esta persona. Con 121 clientes que traen dos a la vez, el
         folio pesa tanto como el nombre. -->
    <div class="space-y-2">
      <p :class="MICRO">
        <ScanSearch class="size-3.5" />
        Coteja contra el pagaré
      </p>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="space-y-3 px-5 py-4">
          <p class="text-[17px] font-semibold leading-snug text-slate-900">
            {{ pagare.cliente_nombre || 'Sin nombre' }}
          </p>

          <!-- En la lista el aviso previene; aqui evita el error, porque este es
               el gesto que registra uno de los dos y da el otro por visto. -->
          <p
            v-if="(mismoNombre ?? 1) > 1"
            class="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-[13px] leading-relaxed text-amber-800"
          >
            <TriangleAlert class="mt-0.5 size-4 shrink-0 text-amber-600" />
            <span>
              Este cliente tiene {{ mismoNombre }} pagarés. Estás registrando sólo el
              <span class="font-semibold">{{ pagare.folio || pagare.id_sistemas }}</span>.
            </span>
          </p>

          <p
            v-if="pagare.cliente_domicilio"
            class="flex items-start gap-2 text-[13px] leading-relaxed text-slate-600"
          >
            <MapPin class="mt-0.5 size-4 shrink-0 text-slate-400" />
            <span>{{ pagare.cliente_domicilio }}</span>
          </p>

          <a
            v-if="pagare.cliente_telefono"
            :href="`tel:${pagare.cliente_telefono}`"
            class="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-slate-100"
          >
            <Phone class="size-4" />
            <span>Llamar</span>
            <span class="text-slate-300">·</span>
            <span class="tabular-nums text-slate-700">{{ pagare.cliente_telefono }}</span>
          </a>
        </div>

        <!-- Tres columnas iguales, como el bloque de cifras de Solim. -->
        <div class="flex gap-3 border-t border-slate-100 px-5 py-4">
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-medium text-slate-500">Folio</p>
            <p class="mt-0.5 truncate text-base font-semibold tabular-nums text-slate-900">
              {{ pagare.folio || '--' }}
            </p>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-medium text-slate-500">Agencia</p>
            <p class="mt-0.5 truncate text-base font-semibold text-slate-900">
              {{ pagare.agencia || '--' }}
            </p>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-medium text-slate-500">Liquidó</p>
            <p class="mt-0.5 truncate text-base font-semibold tabular-nums text-slate-900">
              {{
                pagare.semana_liquidacion && pagare.anio_liquidacion
                  ? `S${pagare.semana_liquidacion}/${pagare.anio_liquidacion}`
                  : '--'
              }}
            </p>
          </div>
        </div>

        <div
          class="flex flex-wrap items-center gap-1.5 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px] text-slate-500"
        >
          <span class="tabular-nums">Pagaré {{ pagare.id_sistemas }}</span>
          <template v-if="pagare.folio_solicitud">
            <span class="text-slate-300">·</span>
            <span class="tabular-nums">Solicitud {{ pagare.folio_solicitud }}</span>
          </template>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <p :class="MICRO">
        <SquarePen class="size-3.5" />
        Datos del talón
      </p>

      <div class="space-y-5 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div class="space-y-2">
          <label for="nombre_recibio" :class="ETIQUETA">
            ¿Quién recibió el pagaré? <span class="text-rose-600">*</span>
          </label>
          <input
            id="nombre_recibio"
            v-model="formData.nombre_quien_recibio"
            type="text"
            placeholder="Como viene en el talón"
            :class="CAMPO"
          />
        </div>

        <!-- Tres botones resuelven casi todas las entregas; la lista completa
             solo se despliega cuando hace falta. -->
        <div class="space-y-2">
          <span :class="ETIQUETA">Parentesco</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opcion in PARENTESCOS_FRECUENTES"
              :key="opcion"
              type="button"
              class="h-10 rounded-full border px-4 text-sm font-medium transition"
              :class="
                formData.parentesco_quien_recibio === opcion
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              "
              @click="elegirParentesco(opcion)"
            >
              {{ opcion }}
            </button>

            <button
              type="button"
              class="h-10 rounded-full border px-4 text-sm font-medium transition"
              :class="
                verTodosParentescos
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              "
              @click="verTodosParentescos = !verTodosParentescos"
            >
              Otro…
            </button>
          </div>

          <select
            v-if="verTodosParentescos"
            id="parentesco"
            v-model="formData.parentesco_quien_recibio"
            :class="CAMPO"
          >
            <option value="">Seleccione un parentesco</option>
            <option v-for="opcion in PARENTESCOS_RESTANTES" :key="opcion" :value="opcion">
              {{ opcion }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label for="fecha_entrega" :class="ETIQUETA">Fecha de entrega</label>
          <input
            id="fecha_entrega"
            v-model="formData.fecha_entrega_pagare"
            type="date"
            :class="CAMPO"
          />
        </div>

        <div class="space-y-2">
          <button
            v-if="!verObservaciones"
            type="button"
            class="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
            @click="verObservaciones = true"
          >
            + Agregar observación
          </button>

          <template v-else>
            <label for="observaciones" :class="ETIQUETA">Observaciones</label>
            <textarea
              id="observaciones"
              v-model="formData.observaciones"
              rows="3"
              placeholder="Cualquier detalle del talón que oficina deba conservar"
              class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </template>
        </div>
      </div>
    </div>

    <p class="px-1 text-center text-[12px] leading-relaxed text-slate-500">
      Oficina cierra el pagaré cuando le regreses el talón.
    </p>

    <div class="flex gap-2.5">
      <button
        type="button"
        class="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        :disabled="isSaving"
        @click="emit('close')"
      >
        Cancelar
      </button>

      <button
        type="button"
        class="inline-flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400"
        :disabled="isSaving || !puedeGuardar"
        @click="handleSave"
      >
        <LoaderCircle v-if="isSaving" class="size-4 animate-spin" />
        {{ isSaving ? 'Guardando…' : esActualizacion ? 'Actualizar entrega' : 'Registrar entrega' }}
      </button>
    </div>
  </section>
</template>
