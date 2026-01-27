<script setup lang="ts">
import { computed } from 'vue'
import { useIncidentData } from '../composables'
import { useIncidentStore } from '../stores'
import { useDrawer } from '@/shared/composables'
import type { IIncident, IIncidentFormData } from '../types'

// Components
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import IncidentForm from './IncidentForm.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'

// Stores & Composables
const incidentStore = useIncidentStore()
const incidentDrawer = useDrawer<IIncident>('incident')
const { isUserManager, gerenciaSelected, saveIncident } = useIncidentData()

// Computed
const isEditing = computed(() => !!incidentDrawer.selectedData.value)
const drawerTitle = computed(() =>
  isEditing.value ? 'Ver Incidente' : 'Nuevo Incidente'
)

// Methods
async function handleSubmit(formData: IIncidentFormData) {
  try {
    await saveIncident(formData)
    incidentDrawer.reset()
  } catch (error) {
    // Error is handled in the composable
  }
}

function handleOpenChange(open: boolean) {
  if (!open) {
    incidentDrawer.reset()
  }
}
</script>

<template>
  <Drawer :open="incidentDrawer.isOpen.value" @update:open="handleOpenChange">
    <DrawerContent class="max-h-[90vh]">
      <div class="mx-auto w-full max-w-lg overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>{{ drawerTitle }}</DrawerTitle>
          <DrawerDescription>
            {{ isEditing ? 'Detalles del incidente registrado' : 'Completa el formulario para registrar un nuevo incidente o salida' }}
          </DrawerDescription>
        </DrawerHeader>

        <div class="px-4 pb-4 space-y-4">
          <AlertMsg
            v-if="!isEditing && isUserManager"
            type="info"
            label="Estás agregando un incidente/salida"
            :message="`en la gerencia ${gerenciaSelected}`"
          />

          <IncidentForm
            :incident="incidentDrawer.selectedData.value"
            :is-saving="incidentStore.isSavingIncident"
            @submit="handleSubmit"
          />
        </div>

        <DrawerFooter v-if="isEditing">
          <Button variant="outline" @click="incidentDrawer.close()">
            Cerrar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
