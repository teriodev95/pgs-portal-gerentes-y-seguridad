<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SlideUnlock from 'vue-slide-unlock'
import { useStore } from '@/shared/stores'
import { useRevealCircleStore } from '@/shared/stores/revealCircle'
import { toCurrency } from '@/shared/utils'
import { pagosAdelantadosService } from '../services/pagos-adelantados.service'
import type { IPayment, IResumenAdelantado } from '../types'

// Components
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'

// Drawer SIEMPRE montado, controlado por la prop (payment=null -> cerrado).
// Mismo patrón que ReportDrawer para no romper el ciclo de vida de vaul.
interface Props {
  payment: IPayment | null
}

interface Emits {
  (e: 'close'): void
  (e: 'marcado'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $store = useStore()
const revealCircle = useRevealCircleStore()

// El preview y la confirmación son EL MISMO stored procedure (dry-run vs
// ejecución): todo lo que se pinta aquí viene del backend, nada se calcula
// en el front. El éxito se celebra con el revealCircle estándar de la app
// (mismo mecanismo que registrar un pago), no con una pantalla propia.
type Estado = 'cargando' | 'preview' | 'confirmando' | 'error'
const estado = ref<Estado>('cargando')
const resumen = ref<IResumenAdelantado | null>(null)
const errorMensaje = ref('')

const usuario = computed(() => {
  const u = $store.user
  return u ? `${u.nombre} ${u.apellidoPaterno}`.trim() : 'pgs'
})

function notificarExito(data: IResumenAdelantado) {
  const completas = data.detalleSemanas.filter((d) => d.cobertura === 'COMPLETA')
  const parcial = data.detalleSemanas.find((d) => d.cobertura === 'PARCIAL')

  const lista = completas.map(
    (d) => `Semana ${d.semana} (${formatFecha(d.fecha)}): pagada por adelantado`
  )
  if (parcial) {
    lista.push(
      `Semana ${parcial.semana} (${formatFecha(parcial.fecha)}): solo se le cobrarán ${toCurrency(parcial.a_cobrar)}`
    )
  }

  revealCircle.showRevealCircle({
    type: 'success',
    mainText: '¡Pago adelantado confirmado!',
    secondaryText: `Las semanas de ${data.cliente} quedaron así:`,
    list: lista,
    subText: 'El sistema rechazará cobros en las semanas adelantadas.',
    ctaText: 'Entendido'
  })
}

function formatFecha(iso: string) {
  const fecha = new Date(`${iso}T12:00:00`)
  return new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).format(fecha)
}

function extraerMensaje(error: any): string {
  return (
    error?.response?.data?.error ??
    'No se pudo calcular el adelanto. Intenta de nuevo o contacta a soporte.'
  )
}

async function cargarPreview(pagoId: string) {
  estado.value = 'cargando'
  resumen.value = null
  errorMensaje.value = ''
  confirmacionAceptada.value = false
  try {
    const { data } = await pagosAdelantadosService.preview(pagoId, usuario.value)
    if (data.success && data.data) {
      resumen.value = data.data
      estado.value = 'preview'
    } else {
      errorMensaje.value = data.error ?? 'Respuesta inesperada del servidor'
      estado.value = 'error'
    }
  } catch (error) {
    errorMensaje.value = extraerMensaje(error)
    estado.value = 'error'
  }
}

const slideUnlockRef = ref()

// Doble confirmación para una acción difícil de corregir: el checkbox de
// reconocimiento desbloquea el slider. Dos gestos deliberados distintos.
const confirmacionAceptada = ref(false)

async function confirmar() {
  if (!props.payment) return
  estado.value = 'confirmando'
  try {
    const { data } = await pagosAdelantadosService.confirmar(props.payment.pagoId, usuario.value)
    if (data.success && data.data) {
      emit('marcado')
      emit('close')
      notificarExito(data.data)
    } else {
      errorMensaje.value = data.error ?? 'Respuesta inesperada del servidor'
      estado.value = 'error'
    }
  } catch (error) {
    errorMensaje.value = extraerMensaje(error)
    estado.value = 'error'
  }
}

function handleOpenChange(open: boolean) {
  if (!open) emit('close')
}

watch(
  () => props.payment,
  (payment) => {
    if (payment) cargarPreview(payment.pagoId)
  }
)
</script>

<template>
  <Drawer :open="!!payment" @update:open="handleOpenChange">
    <DrawerContent>
      <div v-if="payment" class="mx-auto w-full max-w-lg overflow-y-auto px-4 pb-6">
        <DrawerHeader class="px-0">
          <DrawerTitle>Pago adelantado</DrawerTitle>
          <DrawerDescription>{{ resumen?.cliente ?? payment.pagoId }}</DrawerDescription>
        </DrawerHeader>

        <!-- Estado: cargando -->
        <div v-if="estado === 'cargando'" class="flex flex-col items-center gap-3 py-10">
          <svg class="h-8 w-8 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <TextCT variant="secondary">Calculando…</TextCT>
        </div>

        <!-- Estado: error (mensaje del backend tal cual, sin confirmar) -->
        <div v-else-if="estado === 'error'" class="space-y-4 py-4">
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {{ errorMensaje }}
          </div>
          <BtnComponent variant="primary" outline full-width @click="emit('close')">
            Cerrar
          </BtnComponent>
        </div>

        <!-- Estado: preview / confirmando -->
        <div v-else-if="resumen" class="space-y-4">
          <p class="text-sm text-gray-600">
            El cliente pagó <b class="text-gray-900">{{ toCurrency(resumen.montoPagadoSemana) }}</b>
            esta semana: cubre su tarifa actual y le alcanza para adelantar:
          </p>

          <!-- Semanas: filas estructuradas con columna "a cobrar" uniforme -->
          <div class="divide-y divide-gray-100 overflow-hidden rounded-lg border">
            <div
              v-for="detalle in resumen.detalleSemanas"
              :key="`${detalle.anio}-${detalle.semana}`"
              class="flex items-center gap-3 p-3"
              :class="detalle.cobertura === 'COMPLETA' ? 'bg-green-50/50' : 'bg-amber-50/50'"
            >
              <!-- Icono de cobertura: círculo lleno vs medio círculo -->
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                :class="detalle.cobertura === 'COMPLETA' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-600'"
              >
                <svg v-if="detalle.cobertura === 'COMPLETA'" class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <svg v-else class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
                  <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
                </svg>
              </span>

              <span class="flex min-w-0 flex-1 flex-col">
                <span class="text-sm font-semibold text-gray-800">Semana {{ detalle.semana }}</span>
                <span class="text-xs text-gray-500">
                  {{ formatFecha(detalle.fecha) }} ·
                  {{ detalle.cobertura === 'COMPLETA' ? 'pagada por adelantado' : `ya abonó ${toCurrency(detalle.cubierto)}` }}
                </span>
              </span>

              <span class="flex shrink-0 flex-col items-end">
                <span
                  class="text-sm font-bold"
                  :class="detalle.cobertura === 'COMPLETA' ? 'text-green-700' : 'text-amber-700'"
                >{{ toCurrency(detalle.a_cobrar) }}</span>
                <span class="text-[10px] font-medium uppercase text-gray-400">a cobrar</span>
              </span>
            </div>
          </div>

          <!-- Advertencias -->
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p class="mb-1.5 text-sm font-semibold text-gray-800">Antes de confirmar</p>
            <ul class="list-inside list-disc space-y-1 text-[13px] leading-snug text-gray-600">
              <li>El sistema no dejará cobrarle en las semanas adelantadas.</li>
              <li>Si el cliente quiere liquidar, sí puede.</li>
              <li>No se puede deshacer desde aquí: si te equivocas, levanta un ticket a soporte.</li>
            </ul>
          </div>

          <!-- Doble confirmación (la corrección es compleja): 1) checkbox de
               reconocimiento explícito, 2) slide-to-confirm (mismo patrón que
               Registrar Pago). El slider se desbloquea con el check. -->
          <div class="space-y-3">
            <label
              class="flex cursor-pointer select-none items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors"
              :class="{ 'border-blue-300 bg-blue-50/50': confirmacionAceptada }"
            >
              <input
                v-model="confirmacionAceptada"
                type="checkbox"
                class="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                :disabled="estado === 'confirmando'"
              />
              <span class="text-sm leading-snug text-gray-700">
                Confirmo que el cliente dejó estas semanas
                <b>pagadas por adelantado</b> y entiendo que no se le cobrará en ellas.
              </span>
            </label>

            <div
              class="transition-opacity"
              :class="{ 'pointer-events-none opacity-40': !confirmacionAceptada }"
            >
              <slide-unlock
                ref="slideUnlockRef"
                :auto-width="true"
                :circle="true"
                :disabled="estado === 'confirmando' || !confirmacionAceptada"
                :noanimate="false"
                text="Desliza para confirmar"
                success-text="Confirmado"
                name="slideunlock"
                :style="{
                  '--su-color-text-normal': 'white',
                  '--su-color-bg': 'rgb(26 86 219 / 1)',
                  '--su-color-progress-normal-bg': 'rgb(14 159 110 / 1)',
                  '--su-color-progress-complete-bg': 'rgb(14 159 110 / 1)',
                  '--su-size-padding': '0',
                  '--su-size-text': '15px'
                }"
                @completed="confirmar"
              />
            </div>

            <button
              type="button"
              class="w-full py-2 text-center text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-50"
              :disabled="estado === 'confirmando'"
              @click="emit('close')"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
