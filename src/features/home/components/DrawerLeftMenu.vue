<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { APP_VERSION } from '@/shared/constants'
import { useStore } from '@/shared/stores'
import { commonService } from '@/shared/services/modules'
import { useNotification } from '@/shared/composables/useNotification'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerPortal,
  DrawerOverlay
} from '@/components/ui/drawer'

// Components
import IconUser from '@/shared/components/icons/UserCircle.vue'
import IconLogout from '@/shared/components/icons/UserLogout.vue'
import IconBankNotes from '@/shared/components/icons/BankNotesIcon.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

// Services, Composables and Stores initialization
const $router = useRouter()
const $store = useStore()
const { showError } = useNotification()

// Props
interface Props {
  open: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Constants
const version = APP_VERSION

// State definitions
const sucursales = computed(() => $store.sucursales)
const user = computed(() => $store.user)
const isLogoutModalOpen = ref(false)

// Methods
function closeDrawer() {
  emit('update:open', false)
}

async function preloadData(sucursal: string) {
  if (user.value) {
    closeDrawer()
    $store.loading = true
    try {
      $store.gerencias = []
      $store.gerenciaSelected = undefined
      $store.agencies = []
      $store.agencySelected = undefined
      $store.cobranzas = []
      $store.cobranzaSelected = undefined
      if (user.value.tipo === 'Seguridad' || user.value.tipo === 'Regional') {
        const gerenciasResp = await commonService.getGerenciesCopy(user.value.usuario)

        const sucursales = Object.keys(gerenciasResp.data)
        $store.sucursales = sucursales
        $store.sucursal = sucursal
        $store.gerencias = gerenciasResp.data[$store.sucursal]

        $store.gerenciaSelected = $store.gerencias[0].gerencia
      } else {
        $store.gerenciaSelected = user.value.gerencia
      }

      if ($store.gerenciaSelected) {
        const agenciesResp = await commonService.getAgenciesCopy($store.gerenciaSelected)
        $store.agencies = agenciesResp.data

        if ($store.agencies.length) {
          $store.agencySelected = $store.agencies[0].agencia

          const dateResp = await commonService.getCurrentDate()
          $store.currentDate = {
            week: dateResp.data.semana,
            year: dateResp.data.anio
          }

          const cobranzaResp = await commonService.getCobranza({
            agency: $store.agencySelected,
            week: $store.currentDate.week,
            year: $store.currentDate.year
          })

          $store.cobranzas = cobranzaResp.data.cobranza
          if ($store.cobranzas.length) $store.cobranzaSelected = $store.cobranzas[0]

          const agencyResp = await commonService.getAgency({
            agency: $store.agencySelected,
            week: $store.currentDate.week,
            year: $store.currentDate.year
          })

          $store.agencyData = agencyResp.data
        }
      }
    } catch (error) {
      showError('Error al cargar los datos')
    }
    $store.loading = false
  }
}

function navigateToPersonalInfo() {
  closeDrawer()
  $router.push({ name: ROUTE_NAME.PERSONAL_INFORMATION })
}

function openLogoutModal() {
  isLogoutModalOpen.value = true
}

function closeLogoutModal() {
  isLogoutModalOpen.value = false
}

function logout() {
  closeLogoutModal()
  closeDrawer()
  $router.push({ name: ROUTE_NAME.AUTH_LOGIN })
  $store.clearData()
}
</script>

<template>
  <!-- Main Menu Drawer (Left Side) -->
  <Drawer :open="props.open" direction="left" @update:open="(value: boolean) => emit('update:open', value)">
    <DrawerPortal>
      <DrawerOverlay class="!bg-black/20" />
      <DrawerContent class="fixed !inset-y-0 left-0 !top-0 !bottom-0 z-50 !h-screen !min-h-screen w-64 flex flex-col border-r bg-white shadow-xl !rounded-none">
        <!-- User Info Header -->
        <div class="p-4 border-b">
          <div class="flex items-center gap-3">
            <IconUser class="h-12 w-12 text-slate-600" />
            <div class="text-left flex-1">
              <h1 class="text-lg font-semibold text-slate-800">{{ user?.nombre }}</h1>
              <h2 class="text-xs text-slate-600">{{ user?.tipo }}</h2>
              <p class="text-xs text-slate-500">{{ user?.numeroCelular }}</p>
            </div>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Sucursales Section -->
          <div v-if="sucursales.length" class="mb-4">
            <div class="rounded-lg p-2 text-center text-sm font-medium text-gray-700 bg-gray-50 mb-2">
              Sucursales
            </div>

            <ul class="space-y-1">
              <li
                v-for="(sucursal, key) in sucursales"
                :key="`sucursal-${key}`"
                @click="() => preloadData(sucursal)"
                :class="[
                  $store.sucursal === sucursal ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
                  'flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors'
                ]"
              >
                <IconBankNotes class="h-5 w-5" />
                <span class="text-sm font-medium">{{ sucursal }}</span>
              </li>
            </ul>
          </div>

          <!-- Divider -->
          <div class="my-4 border-t border-gray-200"></div>

          <!-- Actions Section -->
          <ul class="space-y-1">
            <li
              class="flex items-center gap-3 rounded-lg p-3 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
              @click="navigateToPersonalInfo"
            >
              <IconUser class="h-5 w-5" />
              <span class="text-sm font-medium">Datos Personales</span>
            </li>
            <li
              class="flex items-center gap-3 rounded-lg p-3 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
              @click="openLogoutModal"
            >
              <IconLogout class="h-5 w-5" />
              <span class="text-sm font-medium">Cerrar Sesión</span>
            </li>
          </ul>
        </div>

        <!-- Footer with Version -->
        <div class="p-4 border-t text-center">
          <p class="text-xs text-slate-500">Versión {{ version }}</p>
        </div>
      </DrawerContent>
    </DrawerPortal>
  </Drawer>

  <!-- Logout Confirmation Drawer -->
  <Drawer :open="isLogoutModalOpen" @update:open="(value: boolean) => value ? null : closeLogoutModal()">
    <DrawerContent>
      <div class="mx-auto w-full max-w-lg">
        <DrawerHeader>
          <DrawerTitle>¿Estás seguro de que quieres cerrar sesión?</DrawerTitle>
          <DrawerDescription>
            Esta acción cerrará tu sesión actual
          </DrawerDescription>
        </DrawerHeader>

        <div class="p-4 pb-6">
          <div class="flex gap-4">
            <BtnComponent variant="secondary" full-width @click="logout">
              Sí, cerrar sesión
            </BtnComponent>

            <BtnComponent variant="secondary" outline full-width @click="closeLogoutModal">
              No, mantener sesión
            </BtnComponent>
          </div>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
