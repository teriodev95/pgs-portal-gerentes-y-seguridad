<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Building2,
  Check,
  ChevronRight,
  LogOut,
  Phone,
  User as UserIcon,
  X
} from 'lucide-vue-next'
import {
  DrawerRoot,
  DrawerContent as VaulDrawerContent,
  DrawerOverlay as VaulDrawerOverlay,
  DrawerPortal as VaulDrawerPortal
} from 'vaul-vue'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { ROUTE_NAME } from '@/router'
import { APP_VERSION } from '@/shared/constants'
import { useStore } from '@/shared/stores'
import { commonService } from '@/shared/services/modules'
import { useNotification } from '@/shared/composables/useNotification'
import { formatPhone } from '@/shared/utils/phone'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const $router = useRouter()
const $store = useStore()
const { showError } = useNotification()

const version = APP_VERSION
const sucursales = computed(() => $store.sucursales)
const user = computed(() => $store.user)
const isLogoutModalOpen = ref(false)

const userInitial = computed(() => {
  const name = user.value?.nombre?.trim()
  return name ? name.charAt(0).toUpperCase() : 'U'
})

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
  <!-- Main Sidebar Drawer (Slides cleanly from Left) -->
  <DrawerRoot
    :open="props.open"
    direction="left"
    @update:open="(value: boolean) => emit('update:open', value)"
  >
    <VaulDrawerPortal>
      <VaulDrawerOverlay class="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300" />
      <VaulDrawerContent
        class="fixed inset-y-0 left-0 z-50 flex h-full w-[280px] sm:w-[320px] max-w-[85vw] flex-col border-r border-slate-200/80 bg-white shadow-2xl outline-none"
      >
        <!-- Header Profile -->
        <div class="border-b border-slate-100 p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-base font-bold text-blue-700 shadow-sm"
              >
                {{ userInitial }}
              </div>
              <div class="min-w-0 flex-1">
                <h1 class="truncate text-sm font-bold leading-tight text-slate-900">
                  {{ user?.nombre || 'Usuario' }}
                </h1>
                <div class="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span
                    v-if="user?.tipo"
                    class="inline-flex items-center rounded-md border border-blue-100/80 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700"
                  >
                    {{ user?.tipo }}
                  </span>
                </div>
                <p
                  v-if="user?.numeroCelular"
                  class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-400"
                >
                  <Phone class="size-3 text-slate-400" aria-hidden="true" />
                  {{ formatPhone(user.numeroCelular) || user.numeroCelular }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Cerrar menú lateral"
              @click="closeDrawer"
            >
              <X class="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Scrollable Navigation Area -->
        <div class="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <!-- Sucursales Section -->
          <div v-if="sucursales.length" class="space-y-1">
            <span class="block px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sucursales
            </span>
            <div class="space-y-1 pt-1">
              <button
                v-for="(sucursal, key) in sucursales"
                :key="`sucursal-${key}`"
                type="button"
                class="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-600"
                :class="
                  $store.sucursal === sucursal
                    ? 'border border-blue-200/80 bg-blue-50/90 text-blue-900 shadow-sm'
                    : 'border border-transparent text-slate-700 hover:bg-slate-50'
                "
                @click="() => preloadData(sucursal)"
              >
                <div class="flex items-center gap-2.5 truncate">
                  <Building2
                    class="size-4 shrink-0"
                    :class="$store.sucursal === sucursal ? 'text-blue-700' : 'text-slate-400'"
                    aria-hidden="true"
                  />
                  <span class="truncate">{{ sucursal }}</span>
                </div>
                <Check
                  v-if="$store.sucursal === sucursal"
                  class="size-4 shrink-0 text-blue-700"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <!-- Account Section -->
          <div class="space-y-1">
            <span class="block px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Mi cuenta
            </span>
            <div class="space-y-1 pt-1">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                @click="navigateToPersonalInfo"
              >
                <div class="flex items-center gap-2.5">
                  <UserIcon class="size-4 text-slate-400" aria-hidden="true" />
                  <span>Datos personales</span>
                </div>
                <ChevronRight class="size-4 text-slate-300" aria-hidden="true" />
              </button>

              <button
                type="button"
                class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                @click="openLogoutModal"
              >
                <LogOut class="size-4 text-red-500" aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-100 px-4 py-3 text-center">
          <p class="text-[11px] font-medium text-slate-400">Versión {{ version }}</p>
        </div>
      </VaulDrawerContent>
    </VaulDrawerPortal>
  </DrawerRoot>

  <!-- Logout Confirmation Drawer -->
  <Drawer :open="isLogoutModalOpen" @update:open="(value: boolean) => value ? null : closeLogoutModal()">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm px-4 pb-6 pt-2 text-center">
        <div class="mx-auto mb-2 flex size-11 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
          <LogOut class="size-5" aria-hidden="true" />
        </div>
        <DrawerHeader class="px-0 pt-1 text-center">
          <DrawerTitle class="text-base font-bold text-slate-900">¿Cerrar sesión?</DrawerTitle>
          <DrawerDescription class="text-xs text-slate-500">
            Se cerrará tu sesión actual en este dispositivo.
          </DrawerDescription>
        </DrawerHeader>

        <div class="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="min-h-11 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
            @click="logout"
          >
            Sí, salir
          </button>
          <button
            type="button"
            class="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            @click="closeLogoutModal"
          >
            Cancelar
          </button>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>
