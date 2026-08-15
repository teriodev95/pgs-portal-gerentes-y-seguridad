<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { MessageCircle, Phone } from 'lucide-vue-next'
import { securityAgendaService } from '../services/agenda.service'
import { formatPhone, isDialable, telHref, whatsappHref } from '@/shared/utils/phone'
import type { AgendaAgencyContact } from '../types'

interface Props {
  /** Clave de la agencia de la actividad; sin agencia no se monta la tarjeta. */
  agenciaId: string
}

const props = defineProps<Props>()

const contacto = ref<AgendaAgencyContact | null>(null)
const cargando = ref(true)
const fallo = ref(false)

/**
 * La hoja se abre para una actividad y luego para otra sin desmontar la
 * tarjeta: sin este contador, la respuesta lenta de la agencia anterior pisa
 * a la de la actual y se muestra el teléfono equivocado.
 */
let ultimaPeticion = 0

async function cargar(agenciaId: string) {
  const peticion = ++ultimaPeticion
  cargando.value = true
  fallo.value = false

  try {
    const data = await securityAgendaService.getAgencyContact(agenciaId)
    if (peticion !== ultimaPeticion) return
    contacto.value = data
  } catch {
    // La tarjeta es un extra sobre la ficha: si no carga, desaparece entera y
    // lo demás se lee igual. Ni mensaje de error ni reintento.
    if (peticion !== ultimaPeticion) return
    contacto.value = null
    fallo.value = true
  } finally {
    if (peticion === ultimaPeticion) cargando.value = false
  }
}

watch(() => props.agenciaId, cargar, { immediate: true })

/** Lo único que borra la sección completa —encabezado y aire— es el fallo. */
const visible = computed(() => !fallo.value)

const telefono = computed(() => formatPhone(contacto.value?.celular) || 'Sin teléfono')

/** Con el número incompleto se muestra el dato, pero no se ofrece a dónde ir. */
const enlazable = computed(() => isDialable(contacto.value?.celular))

/** Dos letras del nombre; con un solo nombre basta la primera. */
const iniciales = computed(() => {
  const partes = (contacto.value?.nombre ?? '').trim().split(/\s+/).filter(Boolean)
  return partes
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
})

/**
 * `size-11` son los 44px de área táctil sobre un icono de 18: el aire alrededor
 * es el botón. Van los dos iguales, así que la lista se escribe una vez.
 */
const ACCION_CLASS =
  'flex size-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors duration-150 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none'
</script>

<template>
  <!--
    Contacto del agente de la agencia donde ocurre la actividad. El espaciado
    vive aquí, en la raíz, y no en quien la usa: cuando no hay nada que mostrar
    la sección se va completa y no queda una banda vacía entre dos divisorias.

    Este bloque NO puede alcanzar el enlace público: es el celular personal de
    una persona y ese enlace circula por WhatsApp.
  -->
  <div v-if="visible" class="px-4 py-6">
    <p class="mb-2 text-sm text-gray-600">Agente de la agencia</p>

    <!-- Mientras carga, una línea: un spinner por un dato accesorio pesa más. -->
    <div v-if="cargando" role="status">
      <span class="block h-4 w-44 animate-pulse rounded bg-gray-100 motion-reduce:animate-none" />
      <span class="sr-only">Cargando el contacto de la agencia…</span>
    </div>

    <!--
      Una de cada tres agencias está sin cubrir (120 de 406). Se dice en una
      línea, con el mismo peso que cualquier otro dato de la ficha: leerlo como
      un error, tres de cada nueve veces, entrena a desconfiar de la pantalla.
    -->
    <p v-else-if="!contacto" class="text-sm text-gray-900">
      Esta agencia no tiene agente asignado
    </p>

    <div v-else class="flex items-center gap-3 rounded-lg border border-gray-200 p-2">
      <span
        aria-hidden="true"
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700"
      >
        {{ iniciales }}
      </span>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-gray-900">{{ contacto.nombre }}</p>
        <p class="truncate text-sm text-gray-600">{{ telefono }}</p>
      </div>

      <!--
        Enlaces, no integraciones: el sistema operativo abre WhatsApp o el
        marcador. Con el número mal capturado no se pintan, y queda el dato a la
        vista para corregirlo en el padrón.
      -->
      <div v-if="enlazable" class="flex shrink-0 items-center gap-1">
        <a
          :href="whatsappHref(contacto.celular)"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`Enviar WhatsApp a ${contacto.nombre}`"
          :class="ACCION_CLASS"
        >
          <MessageCircle class="size-[18px]" :stroke-width="2" aria-hidden="true" />
        </a>
        <a
          :href="telHref(contacto.celular)"
          :aria-label="`Llamar a ${contacto.nombre}`"
          :class="ACCION_CLASS"
        >
          <Phone class="size-[18px]" :stroke-width="2" aria-hidden="true" />
        </a>
      </div>
    </div>
  </div>
</template>
