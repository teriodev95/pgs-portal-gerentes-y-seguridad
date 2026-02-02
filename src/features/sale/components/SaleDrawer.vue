<script setup lang="ts">
import { computed } from 'vue'
import { useDrawer } from '@/shared/composables'
import { useSaleData } from '../composables'
import { useSaleStore } from '../stores'
import type { SaleDetails, SaleFormData } from '../types'
import { formatToHumanDate, toCurrency } from '@/shared/utils'

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
import SaleForm from './SaleForm.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'
import DataField from '@/shared/components/DataField.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'

// Stores & Composables
const saleStore = useSaleStore()
const saleDrawer = useDrawer<SaleDetails>('sale')
const { gerenciaSelected, saveSale } = useSaleData()

// Computed
const isViewingDetails = computed(() => !!saleDrawer.selectedData.value)
const drawerTitle = computed(() =>
  isViewingDetails.value ? 'Detalles de la venta' : 'Crear Nueva Venta'
)
const drawerDescription = computed(() =>
  isViewingDetails.value
    ? 'Información completa de la venta registrada'
    : 'Completa el formulario para registrar una nueva venta'
)

// Methods
async function handleSubmit(formData: SaleFormData) {
  try {
    await saveSale(formData)
    saleDrawer.reset()
  } catch (error) {
    // Error is handled in the composable
  }
}

function handleOpenChange(open: boolean) {
  if (!open) {
    saleDrawer.reset()
  }
}
</script>

<template>
  <Drawer :open="saleDrawer.isOpen.value" @update:open="handleOpenChange">
    <DrawerContent class="max-h-[90vh]">
      <div class="mx-auto w-full max-w-lg overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>{{ drawerTitle }}</DrawerTitle>
          <DrawerDescription>
            {{ drawerDescription }}
          </DrawerDescription>
        </DrawerHeader>

        <!-- View Details Mode -->
        <SectionContainer v-if="isViewingDetails && saleDrawer.selectedData.value">
          <DataField label="Fecha" :value="formatToHumanDate(saleDrawer.selectedData.value.fecha ?? '')" />
          <DataField label="Agencia" :value="saleDrawer.selectedData.value.agencia" />
          <DataField label="Cliente" :value="saleDrawer.selectedData.value.nombreCliente" />
          <DataField label="Tipo" :value="saleDrawer.selectedData.value.tipo" />
          <DataField label="Nivel" :value="saleDrawer.selectedData.value.nivel" />
          <DataField label="Plazo" :value="saleDrawer.selectedData.value.plazo" />
          <DataField label="Monto" :value="toCurrency(saleDrawer.selectedData.value.monto)" />
          <DataField label="1er Pago" :value="toCurrency(saleDrawer.selectedData.value.primerPago)" />
        </SectionContainer>

        <!-- Create Mode -->
        <SectionContainer v-else>
          <AlertMsg v-if="gerenciaSelected" type="info" label="Estás creando una venta"
            :message="`en la gerencia ${gerenciaSelected}`" />

          <SaleForm :is-saving="saleStore.isSavingSale" @submit="handleSubmit" />
        </SectionContainer>

        <!-- Footer for details view -->
        <DrawerFooter v-if="isViewingDetails">
          <Button variant="outline" @click="saleDrawer.close()">
            Cerrar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
