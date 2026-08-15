<script lang="ts" setup>
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

// Components
import AgendaFab from '@/features/security-agenda/components/AgendaFab.vue'
import { AGENDA_RELEASED } from '@/features/security-agenda/constants'
import FloatBtn from '@/shared/components/FloatBtn.vue'

// Interface - Props - Emits
import { useHomeMenu } from '@/features/home/components/useHomeMenu'

// Services, Composables and Stores initialization
const {
  agency,
  isLoading,
  agencyMenuItems,
  currentWeek,
  formattedCurrentDate,
  generalMenuItems,
  isAgencyDrawerOpen,
  isGeneralDrawerOpen,
  openAgencyActions,
  openGeneralActions,
  closeAgencyActions,
  closeGeneralActions,
  handleMenuItemClick
} = useHomeMenu()
</script>

<template>
  <!-- Agency Actions Drawer -->
  <Drawer :open="isAgencyDrawerOpen" @update:open="(value: boolean) => value ? null : closeAgencyActions()">
    <DrawerContent>
      <div class="mx-auto w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>Opciones de agencia ({{ agency }})</DrawerTitle>
          <div class="text-sm text-gray-600 space-y-1">
            <p>Semana #{{ currentWeek }}</p>
            <p>{{ formattedCurrentDate }}</p>
          </div>
        </DrawerHeader>

        <div class="p-4 pb-6">
          <!-- Agency Menu Grid -->
          <div class="grid grid-cols-2 gap-4">
            <template v-for="item in agencyMenuItems" :key="item.id">
              <div
                v-if="!item.disabled"
                class="flex flex-col items-center cursor-pointer p-4 rounded-lg border transition-all duration-200"
                :class="{
                  'hover:shadow-md hover:border-blue-300 hover:bg-blue-50': true,
                  'bg-blue-50 border-blue-200': item.id === 'dashboard'
                }"
                @click="handleMenuItemClick(item, closeAgencyActions)"
              >
                <div
                  class="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-3 transition-all duration-200">
                  <component :is="item.icon" class="h-6 w-6 transition-colors duration-200" :class="{
                    'text-blue-600': item.id === 'dashboard',
                    'text-gray-600': item.id !== 'dashboard'
                  }" :stroke-width="1.5" />
                </div>
                <h3 class="font-medium text-sm text-center mb-1">{{ item.title }}</h3>
                <p class="text-xs text-gray-500 text-center">{{ item.description }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>

  <!-- General Actions Drawer -->
  <Drawer :open="isGeneralDrawerOpen" @update:open="(value: boolean) => value ? null : closeGeneralActions()">
    <DrawerContent>
      <div class="mx-auto w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>Seleccione una acción</DrawerTitle>
          <div class="text-sm text-gray-600 space-y-1">
            <p>Semana #{{ currentWeek }}</p>
            <p>{{ formattedCurrentDate }}</p>
          </div>
        </DrawerHeader>

        <div class="p-4 pb-6">
          <!-- General Menu Grid -->
          <div class="grid grid-cols-3 gap-1">
            <template v-for="item in generalMenuItems" :key="item.id">
              <div
                v-if="!item.disabled"
                class="flex flex-col items-center cursor-pointer p-3 rounded-lg transition-all duration-200"
                :class="{
                  'hover:bg-gray-50': true,
                  'bg-blue-50 border border-blue-200': item.id === 'gerencia'
                }"
                @click="handleMenuItemClick(item, closeGeneralActions)"
              >
                <div
                  class="size-6 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-2 transition-all duration-200">
                  <component :is="item.icon" class="size-4 transition-colors duration-200" :class="{
                    'text-blue-600': item.id === 'gerencia',
                    'text-gray-600': item.id !== 'gerencia'
                  }" :stroke-width="1.5" />
                </div>
                <h3 class="text-xs font-medium text-center mb-1 leading-tight">{{ item.title }}</h3>
                <p class="text-xs text-gray-500 text-center leading-tight">{{ item.description }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>

  <!--
    Float buttons. Los dos de agencia conservan su condición de siempre; la
    agenda no la comparte, porque el corte de las 7:30 no depende de qué
    agencia esté eligiendo el auditor.

    La agenda va en medio y no a la izquierda: la fila se ancla a la derecha,
    así que cada FAB queda a la distancia que sumen los que tiene a su derecha.
    De primero se correría al aparecer los otros dos —el de agencia mide lo que
    mida el nombre—; en medio sólo tiene al primario, que mide 56px fijos, y por
    eso cae siempre en el mismo punto. El `+` conserva la esquina.
  -->
  <div data-dial-init class="fixed bottom-[6rem] right-6 z-40 flex items-center gap-4">
    <FloatBtn v-if="!isLoading && agency" @click="openAgencyActions" type="secondary" :text="agency" />

    <!-- Se esconde desde aquí y no con un `v-if` dentro del propio botón: sin
         montarse no corre su `watch`, que al abrir el Home consulta la agenda
         del día. Un módulo que todavía no se ofrece tampoco debe estar
         pegándole a su endpoint. -->
    <AgendaFab v-if="AGENDA_RELEASED" />

    <FloatBtn v-if="!isLoading && agency" @click="openGeneralActions" type="primary" />
    <!-- Sin el primario hay que dejar su hueco: si no, la agenda se va a la esquina. -->
    <div v-else class="pointer-events-none size-14 shrink-0" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* Estilos adicionales para transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>