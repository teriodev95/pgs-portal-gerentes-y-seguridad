<script setup lang="ts">
import { computed } from 'vue'
import { MessageCircle, PhoneCall, Smartphone } from 'lucide-vue-next'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { formatPhone, isDialable, telHref, whatsappHref } from '@/shared/utils/phone'
import { formatCurrency } from '../cash-report.utils'
import type { CashContactContext } from '../cash-report.types'

const props = defineProps<{
  open: boolean
  contact: CashContactContext | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const phone = computed(() => props.contact?.responsable.telefono ?? null)
const canContact = computed(() => isDialable(phone.value))
const managerName = computed(() => props.contact?.responsable.nombre || 'Responsable sin nombre')
const displayPhone = computed(() => formatPhone(phone.value) || 'Sin teléfono registrado')
const whatsappMessage = computed(() => {
  if (!props.contact) return ''
  return `Hola ${managerName.value}, el reporte de efectivo de ${props.contact.gerencia} muestra ${formatCurrency(props.contact.monto)} en ${props.contact.concepto.toLowerCase()}. ¿Nos ayudas a revisarlo?`
})
</script>

<template>
  <Drawer :open="open" @update:open="emit('update:open', $event)">
    <DrawerContent>
      <div v-if="contact" class="mx-auto w-full max-w-sm px-4 pb-6 pt-2 text-center">
        <!-- Header badge -->
        <div class="inline-flex items-center gap-1.5 rounded-full border border-red-200/80 bg-red-50/70 px-3 py-1 text-xs font-semibold text-red-700">
          <span class="size-1.5 rounded-full bg-red-600" />
          {{ contact.gerencia }} · {{ contact.concepto }}
        </div>

        <!-- Amount Hero -->
        <div class="mt-3">
          <strong class="block text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {{ formatCurrency(contact.monto) }}
          </strong>
          <span class="mt-0.5 block text-xs font-medium text-slate-400">
            Importe a conciliar
          </span>
        </div>

        <!-- Manager Details Bar -->
        <div class="mt-4 flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 text-left">
          <div class="min-w-0 flex-1">
            <span class="block truncate text-xs font-bold text-slate-900">{{ managerName }}</span>
            <span class="mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Smartphone class="size-3.5 text-slate-400" aria-hidden="true" />
              {{ displayPhone }}
            </span>
          </div>
          <span class="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {{ contact.gerencia }}
          </span>
        </div>

        <!-- Action Buttons -->
        <div v-if="canContact && contact?.responsable.telefono" class="mt-4 grid grid-cols-2 gap-3">
          <a
            :href="whatsappHref(contact.responsable.telefono, whatsappMessage)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            <MessageCircle class="size-4" aria-hidden="true" />
            WhatsApp
          </a>
          <a
            :href="telHref(contact.responsable.telefono)"
            class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            <PhoneCall class="size-4" aria-hidden="true" />
            Llamar
          </a>
        </div>

        <p
          v-else
          class="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs font-medium text-amber-900"
          role="status"
        >
          No se puede iniciar el contacto hasta registrar un celular de 10 dígitos.
        </p>
      </div>
    </DrawerContent>
  </Drawer>
</template>
