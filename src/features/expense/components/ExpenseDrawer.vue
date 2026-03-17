<script setup lang="ts">
import { computed } from 'vue'
import { useExpenseData } from '../composables'
import { useExpenseStore } from '../stores'
import { useDrawer } from '@/shared/composables'
import type { WeeklyExpense, ExpenseFormData } from '../types'

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
import ExpenseForm from './ExpenseForm.vue'
import AlertMsg from '@/shared/components/AlertMsg.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'

// Stores & Composables
const expenseStore = useExpenseStore()
const expenseDrawer = useDrawer<WeeklyExpense>('expense')
const { user, isUserManager, gerenciaSelected, saveExpense } = useExpenseData()

// Computed
const isEditing = computed(() => !!expenseDrawer.selectedData.value)
const drawerTitle = computed(() =>
  isEditing.value ? 'Ver Gasto' : 'Nuevo Gasto'
)

// Methods
async function handleSubmit(formData: ExpenseFormData) {
  try {
    await saveExpense(formData)
    expenseDrawer.reset()
  } catch (error) {
    // Error is handled in the composable
  }
}

function handleOpenChange(open: boolean) {
  if (!open) {
    expenseDrawer.reset()
  }
}
</script>

<template>
  <Drawer :open="expenseDrawer.isOpen.value" @update:open="handleOpenChange">
    <DrawerContent class="max-h-[90vh]">
      <div class="mx-auto w-full max-w-lg overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>{{ drawerTitle }}</DrawerTitle>
          <DrawerDescription>
            {{ isEditing ? 'Detalles del gasto registrado' : 'Completa el formulario para registrar un nuevo gasto semanal' }}
          </DrawerDescription>
        </DrawerHeader>

        <SectionContainer>
          <AlertMsg
            v-if="!isEditing && isUserManager"
            type="info"
            label="Estás agregando un gasto"
            :message="`en la gerencia ${gerenciaSelected}`"
          />

          <ExpenseForm
            v-if="expenseDrawer.selectedData.value"
            :expense="expenseDrawer.selectedData.value"
            :usuario-id="user?.usuarioId || 0"
            :is-saving="expenseStore.isSavingExpense"
            @submit="handleSubmit"
          />
          <ExpenseForm
            v-else
            :usuario-id="user?.usuarioId || 0"
            :is-saving="expenseStore.isSavingExpense"
            @submit="handleSubmit"
          />
        </SectionContainer>

        <DrawerFooter v-if="isEditing">
          <Button variant="outline" @click="expenseDrawer.close()">
            Cerrar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
