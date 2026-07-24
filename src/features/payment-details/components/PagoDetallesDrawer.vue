<script setup lang="ts">
import { computed, ref } from 'vue'
import { latLng } from 'leaflet'
import { useStore } from '@/shared/stores'
import { toCurrency } from '@/shared/utils'
import { tipoBadgeClass, tipoPagoLabel } from '../constants'
import { fechaLarga, parseRemanenteAdelanto } from '../helpers'
import type { IPayment } from '../types'

// Components
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import MapWidget from '@/shared/components/MapWidget.vue'
import ToolsIcon from '@/shared/components/icons/ToolsIcon.vue'
import NavigationIcon from '@/shared/components/icons/NavigationIcon.vue'
import ArrowRight from '@/shared/components/icons/ArrowRight.vue'

export type AccionPago = 'showMap' | 'correction'

// Drawer SIEMPRE montado, controlado por la prop (payment=null -> cerrado).
// Mismo patrón que ReportDrawer: destruirlo con v-if a media animación rompe
// el ciclo de vida de vaul (TypeError emitsOptions).
interface Props {
  payment: IPayment | null
}

interface Emits {
  (e: 'close'): void
  (e: 'accion', accion: AccionPago, payment: IPayment): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $store = useStore()

// Contextual Interaction Design: cada acción aparece SOLO cuando aplica a
// este pago; el resto ni se muestra (menos ruido, menos errores).
const tieneUbicacion = computed(() => !!(props.payment?.lat && props.payment?.lng))

const ubicacion = computed(() =>
  props.payment && tieneUbicacion.value ? latLng(props.payment.lat!, props.payment.lng!) : null
)

function comoLlegar() {
  if (!ubicacion.value) return
  const { lat, lng } = ubicacion.value
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
  window.open(url, '_blank', 'noopener,noreferrer')
}

// ID legible + copiar con feedback (soporte siempre pide el ID completo)
const idCorto = computed(() => {
  const id = props.payment?.pagoId ?? ''
  return id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id
})

const idCopiado = ref(false)

async function copiarId() {
  if (!props.payment) return
  try {
    await navigator.clipboard.writeText(props.payment.pagoId)
    idCopiado.value = true
    setTimeout(() => (idCopiado.value = false), 2000)
  } catch {
    /* clipboard no disponible: sin feedback, sin romper */
  }
}

const esSemanaActual = computed(
  () =>
    !!props.payment &&
    props.payment.semana === $store.currentDate.week &&
    props.payment.anio === $store.currentDate.year
)

const yaAdelantado = computed(() => !!props.payment?.comentario?.includes('ADELANTO:'))

// Fila de semana cubierta (marcador del sistema, monto 0): no es un pago de
// dinero, es el registro de que la semana quedó pagada por anticipado
const esMarcadorAdelanto = computed(() => props.payment?.tipo === 'Adelantado')

// Remanente que el adelanto dejó abonado para la semana siguiente (helper
// compartido con el acordeón)
const remanenteAdelanto = computed(() => parseRemanenteAdelanto(props.payment))

const fechaLegible = computed(() => (props.payment ? fechaLarga(props.payment.fechaPago) : ''))

// Nota: la historia pago↔tarifa NO va aquí — la tarifa es una vara SEMANAL
// (con 2 pagos en la misma semana, comparar cada uno contra la tarifa
// mentiría). Esa historia vive en el ítem de semana del historial.

function handleOpenChange(open: boolean) {
  if (!open) emit('close')
}
</script>

<template>
  <Drawer :open="!!payment" @update:open="handleOpenChange">
    <DrawerContent>
      <div v-if="payment" class="mx-auto w-full max-w-lg overflow-y-auto px-4 pb-6">
        <DrawerHeader class="px-0 pb-2 text-center">
          <DrawerTitle>Semana {{ payment.semana }} · {{ payment.anio }}</DrawerTitle>
          <DrawerDescription>{{ fechaLegible }}</DrawerDescription>
        </DrawerHeader>

        <!-- Monto + tipo: lo primero que se busca de un pago -->
        <div class="flex flex-col items-center gap-2 py-2">
          <p class="text-3xl font-bold tracking-tight">{{ toCurrency(payment.monto) }}</p>
          <span
            class="rounded-full border px-3 py-0.5 text-xs font-medium"
            :class="tipoBadgeClass(payment.tipo)"
          >
            {{ tipoPagoLabel(payment.tipo) }}
          </span>
        </div>

        <!-- Semana cubierta por adelanto (marcador del sistema) -->
        <div
          v-if="esMarcadorAdelanto"
          class="mt-2 flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 p-3"
        >
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </span>
          <span class="flex flex-col gap-1">
            <span class="text-sm font-semibold text-teal-900">Semana cubierta por pago adelantado</span>
            <span class="text-xs leading-snug text-teal-800">El cliente la pagó por anticipado; el dinero entró en la semana del pago origen. No se le cobra en esta semana.</span>
            <span v-if="remanenteAdelanto" class="text-xs leading-snug text-teal-800">
              Además dejó <b>{{ toCurrency(remanenteAdelanto.remanente) }}</b> abonados a la semana
              siguiente: solo se le cobrarán <b>{{ toCurrency(remanenteAdelanto.aCobrar) }}</b>.
            </span>
          </span>
        </div>

        <!-- Estado de adelanto (Operational Clarity: ya está hecho) -->
        <div
          v-if="yaAdelantado"
          class="mt-2 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3"
        >
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </span>
          <span class="flex flex-col">
            <span class="text-sm font-semibold text-green-900">Pago adelantado</span>
            <span class="text-xs leading-snug text-green-800">Este pago dejó cubiertas semanas siguientes del cliente.</span>
          </span>
        </div>

        <!-- El movimiento que hizo este pago: saldo antes → saldo después.
             La caja cuenta la historia, no lista campos. -->
        <div class="mt-4 rounded-lg border border-gray-100 bg-gray-50/60 p-4">
          <div class="grid grid-cols-[1fr_auto_1fr] items-center">
            <div class="text-center">
              <p class="primary-text">Abre con</p>
              <p class="secondary-text !text-base">{{ toCurrency(payment.abreCon) }}</p>
            </div>
            <ArrowRight class="size-4 text-gray-300" />
            <div class="text-center">
              <p class="primary-text">Cierra con</p>
              <p class="secondary-text !text-base">{{ toCurrency(payment.cierraCon) }}</p>
            </div>
          </div>

          <div class="my-3 border-t border-gray-100"></div>

          <!-- Meta compacta: una sola línea -->
          <p class="text-center text-sm">
            <span class="primary-text">Tarifa </span>
            <span class="secondary-text">{{ toCurrency(payment.tarifa) }}</span>
            <span class="primary-text"> · registrado desde </span>
            <span class="secondary-text">{{ payment.creadoDesde }}</span>
          </p>

          <!-- Comentario: nota de auditoría, tono discreto (no es un valor) -->
          <div v-if="payment.comentario" class="mt-3 border-t border-gray-100 pt-3">
            <p class="text-xs font-light text-gray-400">Comentario</p>
            <p class="mt-0.5 text-[13px] leading-snug text-gray-500">{{ payment.comentario }}</p>
          </div>

          <!-- ID con copiar (Immediate Feedback) -->
          <button
            type="button"
            class="mx-auto mt-3 flex items-center gap-1.5 text-xs font-light text-gray-400 transition-colors hover:text-gray-600"
            @click="copiarId"
          >
            <template v-if="idCopiado">
              <svg class="h-3.5 w-3.5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span class="font-medium text-green-600">ID copiado</span>
            </template>
            <template v-else>
              <span>ID {{ idCorto }}</span>
              <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
              </svg>
            </template>
          </button>
        </div>

        <!-- Ubicación: preview estático tocable (el mapa no captura gestos —
             el scroll del sheet nunca pelea con el mapa). Tocar el preview o
             el botón de ampliar abre la pantalla completa existente. -->
        <div v-if="ubicacion" class="mt-4 space-y-2">
          <button
            type="button"
            aria-label="Ver mapa completo"
            class="relative block h-40 w-full overflow-hidden rounded-lg border
                   [&_.leaflet-control-zoom]:hidden"
            @click="emit('accion', 'showMap', payment)"
          >
            <div class="pointer-events-none h-full w-full">
              <MapWidget
                :center="[ubicacion.lat, ubicacion.lng]"
                :marker="ubicacion"
                readonly
                :zoom="16"
              />
            </div>
            <span
              class="absolute right-2 top-2 z-[1000] rounded-lg border bg-white p-2 text-gray-600 shadow-md"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </span>
          </button>
          <BtnComponent variant="primary" outline full-width @click="comoLlegar">
            <template #icon-left>
              <NavigationIcon class="size-4" />
            </template>
            Iniciar navegación
          </BtnComponent>
        </div>

        <!-- Acciones contextuales (adelantar vive a nivel SEMANA, en el
             acordeón: es una propiedad del agregado semanal, no del pago) -->
        <div class="mt-4 space-y-2">
          <!-- Sin corrección en pagos adelantados: corregir el pago origen
               rompería el marcador y su remanente (solo vía soporte) -->
          <BtnComponent
            v-if="esSemanaActual && !yaAdelantado"
            variant="primary"
            outline
            full-width
            @click="emit('accion', 'correction', payment)"
          >
            <template #icon-left>
              <ToolsIcon class="size-4" />
            </template>
            Solicitar corrección
          </BtnComponent>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
