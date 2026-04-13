<script setup lang="ts">
import { ref } from 'vue'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { IAgencyBasicInfo } from '@/interfaces'

defineProps<{
  agencies: IAgencyBasicInfo[]
  selectedAgency: string
}>()

const emit = defineEmits<{
  select: [agency: string]
}>()

const isOpen = ref(false)

function open(): void {
  isOpen.value = true
}

function close(): void {
  isOpen.value = false
}

function handleSelect(agency: string): void {
  emit('select', agency)
  close()
}

defineExpose({
  open,
  close
})
</script>

<template>
  <Drawer :open="isOpen" @update:open="(value: boolean) => value ? null : close()">
    <DrawerContent class="max-h-[90vh]">
      <div class="mx-auto w-full max-w-lg overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Filtrar solicitudes</DrawerTitle>
          <DrawerDescription>
            Selecciona una agencia de la gerencia activa para acotar la revisión.
          </DrawerDescription>
        </DrawerHeader>

        <div class="px-4 pb-6">
          <div class="max-h-[52vh] overflow-y-auto pr-1">
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition"
                :class="selectedAgency === 'all'
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
                @click="handleSelect('all')"
              >
                Todas
              </button>
              <button
                v-for="agency in agencies"
                :key="agency.agencia"
                type="button"
                class="inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition"
                :class="selectedAgency === agency.agencia
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
                @click="handleSelect(agency.agencia)"
              >
                {{ agency.agencia }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
