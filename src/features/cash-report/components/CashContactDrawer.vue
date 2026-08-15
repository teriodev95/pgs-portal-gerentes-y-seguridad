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
      <div class="mx-auto w-full max-w-lg px-4 pb-7">
        <DrawerHeader class="px-0 text-left">
          <DrawerTitle>Contactar al responsable</DrawerTitle>
          <DrawerDescription>
            Este importe está en rojo y requiere seguimiento.
          </DrawerDescription>
        </DrawerHeader>

        <div v-if="contact" class="border-y border-slate-200 py-4">
          <p class="text-sm font-semibold text-slate-900">{{ managerName }}</p>
          <p class="mt-1 text-sm text-slate-600">{{ contact.gerencia }} · {{ contact.concepto }}</p>
          <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-950">
            {{ formatCurrency(contact.monto) }}
          </p>
          <p class="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
            <Smartphone class="size-4" aria-hidden="true" />
            {{ displayPhone }}
          </p>
        </div>

        <div v-if="canContact && contact?.responsable.telefono" class="mt-5 grid grid-cols-2 gap-3">
          <a
            :href="whatsappHref(contact.responsable.telefono, whatsappMessage)"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#177D47] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#12673A] focus:outline-none focus:ring-2 focus:ring-[#177D47] focus:ring-offset-2"
          >
            <MessageCircle class="size-5" aria-hidden="true" />
            WhatsApp
          </a>
          <a
            :href="telHref(contact.responsable.telefono)"
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            <PhoneCall class="size-5" aria-hidden="true" />
            Llamar
          </a>
        </div>

        <p
          v-else
          class="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
          role="status"
        >
          No se puede iniciar el contacto hasta registrar un celular mexicano de 10 dígitos para este responsable.
        </p>
      </div>
    </DrawerContent>
  </Drawer>
</template>
